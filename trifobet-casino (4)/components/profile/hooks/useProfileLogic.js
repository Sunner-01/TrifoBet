// components/profile/hooks/useProfileLogic.js
import { useState, useCallback } from "react";
import { apiGet, apiPatch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { API_Back_Url as API_URL } from "@/lib/config";

export function useProfileLogic(userData, onUserDataUpdate) {
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  
  const [formData, setFormData] = useState({
    id: userData?.id_usuario || 0,
    nombre: userData?.nombres || "",
    apellido1: userData?.apellido_1 || "",
    apellido2: userData?.apellido_2 || "",
    fecha_nacimiento: userData?.fecha_nacimiento || "",
    correo: userData?.correo || "",
    telefono: userData?.telefono || "",
    saldo: userData?.saldo || 0.00,
    foto_perfil_url: userData?.foto_perfil_url || "/placeholder-user.jpg",
    pais_codigo: userData?.pais || "BO",
    verificado: userData?.verificado || false,
  });

  const { toast } = useToast();

  const fetchUserData = useCallback(async () => {
    try {
      const data = await apiGet('/perfil/me');
      setFormData({
        id: data.id || 0,
        nombre: data.nombre || "",
        apellido1: data.apellido1 || "",
        apellido2: data.apellido2 || "",
        fecha_nacimiento: data.fecha_nacimiento || "",
        correo: data.correo || "",
        telefono: data.telefono || "",
        ci: data.ci || "",
        saldo: data.saldo || 0.00,
        foto_perfil_url: data.foto_perfil_url || "/placeholder-user.jpg",
        pais_codigo: data.pais_codigo || "BO",
        verificado: data.verificado || false,
        stats: data.stats,
        actividad_reciente: data.actividad_reciente,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar los datos del usuario",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleSaveProfile = async () => {
    // Validaciones basicas
    if (!formData.nombre || !formData.apellido1) {
      toast({ title: "Error", description: "El nombre y el primer apellido son obligatorios", variant: "destructive" });
      return false;
    }
    
    if (formData.nombre.length < 3 || formData.apellido1.length < 3) {
      toast({ title: "Error", description: "El nombre y apellido deben tener al menos 3 caracteres", variant: "destructive" });
      return false;
    }
    
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombre) || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.apellido1)) {
      toast({ title: "Error", description: "El nombre y apellido solo pueden contener letras", variant: "destructive" });
      return false;
    }

    if (formData.apellido2 && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(formData.apellido2)) {
      toast({ title: "Error", description: "El segundo apellido solo puede contener letras", variant: "destructive" });
      return false;
    }

    if (formData.telefono && !/^[67][0-9]{7}$/.test(formData.telefono)) {
      toast({ title: "Error", description: "El teléfono debe empezar con 6 o 7 y tener 8 dígitos", variant: "destructive" });
      return false;
    }

    if (formData.ci && !/^[0-9]+$/.test(formData.ci)) {
      toast({ title: "Error", description: "El número de documento (CI) solo debe contener números", variant: "destructive" });
      return false;
    }

    try {
      await apiPatch('/perfil/me', {
        nombre: formData.nombre,
        apellido1: formData.apellido1,
        apellido2: formData.apellido2,
        telefono: formData.telefono,
        ci: formData.ci,
        fechaNacimiento: formData.fecha_nacimiento,
      });

      setHasChanges(true);
      await fetchUserData();
      toast({ title: "Perfil actualizado", description: "Tus datos han sido guardados correctamente" });
      setIsEditing(false);
      return true;
    } catch (error) {
      toast({ title: "Error", description: error.message || "No se pudo actualizar el perfil", variant: "destructive" });
      return false;
    }
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataToSend = new FormData();
    formDataToSend.append("foto", file);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/perfil/me/photo`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });
      
      if (response.ok) {
        setHasChanges(true);
        await fetchUserData();
        toast({ title: "Foto actualizada", description: "La foto se ha guardado exitosamente" });
      } else {
        throw new Error("Fallo al subir la foto");
      }
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return {
    formData,
    setFormData,
    isEditing,
    setIsEditing,
    hasChanges,
    setHasChanges,
    showPhotoModal,
    setShowPhotoModal,
    fetchUserData,
    handleSaveProfile,
    handleUploadPhoto
  };
}
