// components/profile/hooks/useKycLogic.js
import { useState, useCallback } from "react";
import { apiGet } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { API_Back_Url as API_URL } from "@/lib/config";

export function useKycLogic() {
  const [kycEstado, setKycEstado] = useState(null);
  const [kycMensaje, setKycMensaje] = useState("");
  const [kycAnverso, setKycAnverso] = useState(null);
  const [kycReverso, setKycReverso] = useState(null);
  const [isKycLoading, setIsKycLoading] = useState(true);
  const [isKycUploading, setIsKycUploading] = useState(false);
  const [kycError, setKycError] = useState(null);

  const { toast } = useToast();

  const fetchKycStatus = useCallback(async () => {
    try {
      setIsKycLoading(true);
      const kycData = await apiGet('/verificacion/estado');
      setKycEstado(kycData.estado);
      if (kycData.notas_rechazo) setKycMensaje(kycData.notas_rechazo);
    } catch (error) {
      console.error("Error al cargar estado KYC:", error);
    } finally {
      setIsKycLoading(false);
    }
  }, []);

  const handleKycFileChange = (e, setFile) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setKycError("Una de las imágenes supera el límite de 2 MB.");
        toast({ title: "Archivo muy grande", description: "La imagen no debe superar los 2MB", variant: "destructive" });
        return;
      }
      setKycError(null);
      setFile(file);
    }
  };

  const handleKycSubmit = async (e) => {
    e.preventDefault();
    setKycError(null);

    if (!kycAnverso || !kycReverso) {
      setKycError("Debes seleccionar las 2 imágenes antes de enviar.");
      return;
    }

    setIsKycUploading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setKycError("Tu sesión ha expirado.");
        return;
      }

      const formDataKyc = new FormData();
      formDataKyc.append("anverso", kycAnverso);
      formDataKyc.append("reverso", kycReverso);

      const response = await fetch(`${API_URL}/verificacion/subir`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataKyc,
      });

      const result = await response.json();

      if (response.ok) {
        toast({ title: "¡Documentos enviados!", description: "Tus documentos están siendo revisados." });
        setKycEstado("pendiente");
        setKycAnverso(null);
        setKycReverso(null);
      } else {
        const msg = Array.isArray(result.message) ? result.message.join(", ") : (result.message || "Error al subir.");
        setKycError(msg);
      }
    } catch (error) {
      setKycError("No se pudo conectar con el servidor.");
    } finally {
      setIsKycUploading(false);
    }
  };

  return {
    kycEstado,
    kycMensaje,
    kycAnverso,
    setKycAnverso,
    kycReverso,
    setKycReverso,
    isKycLoading,
    isKycUploading,
    kycError,
    fetchKycStatus,
    handleKycFileChange,
    handleKycSubmit
  };
}
