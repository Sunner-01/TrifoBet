// components/profile/tabs/VerificationTab.jsx
import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, Clock, AlertTriangle, Upload, Mail, Phone } from "lucide-react";
import { useKycLogic } from "../hooks/useKycLogic";

export function VerificationTab({ formData }) {
  const {
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
  } = useKycLogic();

  useEffect(() => {
    fetchKycStatus();
  }, [fetchKycStatus]);

  const verificationStatus = {
    email: formData?.correo_verificado ? "verified" : "not_verified",
    phone: "pending",
  };

  return (
    <div className="grid grid-cols-1 gap-6 p-1 pb-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Verificación de Identidad (KYC)
          </CardTitle>
          <DialogDescription>Requisito obligatorio para poder realizar retiros de tus ganancias.</DialogDescription>
        </CardHeader>
        <CardContent>
          {isKycLoading ? (
            <div className="flex justify-center p-8">
              <Clock className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6">
              {kycEstado === "aprobado" && (
                <div className="bg-green-500/10 border border-green-500/30 p-6 rounded-xl text-center">
                  <CheckCircle size={48} className="mx-auto text-green-500 mb-3" />
                  <h2 className="text-xl font-bold text-green-500 mb-2">¡Identidad Verificada!</h2>
                  <p className="text-sm text-foreground">Tu identidad ha sido verificada correctamente.</p>
                </div>
              )}

              {kycEstado === "pendiente" && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 p-6 rounded-xl text-center">
                  <Clock size={48} className="mx-auto text-yellow-500 mb-3 animate-pulse" />
                  <h2 className="text-xl font-bold text-yellow-500 mb-2">En Revisión</h2>
                  <p className="text-sm text-foreground">Nuestro equipo está revisando tus documentos.</p>
                </div>
              )}

              {(kycEstado === "sin_enviar" || kycEstado === "rechazado" || kycEstado === null) && (
                <div className="space-y-6 animate-in fade-in">
                  {kycEstado === "rechazado" && (
                    <div className="bg-destructive/10 border border-destructive/30 p-4 rounded-xl flex items-start gap-3">
                      <AlertTriangle className="text-destructive shrink-0 mt-0.5" size={20} />
                      <div>
                        <h3 className="font-bold text-destructive text-sm">Solicitud Rechazada</h3>
                        <p className="text-destructive font-medium text-sm mt-1">{kycMensaje}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">1. Anverso de tu CI</label>
                      <div className="relative border-2 border-dashed border-border rounded-lg p-6 hover:bg-muted/50 text-center cursor-pointer group">
                        <input 
                          type="file" 
                          accept="image/jpeg, image/png, image/webp"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          onChange={(e) => handleKycFileChange(e, setKycAnverso)}
                        />
                        {kycAnverso ? (
                          <div className="text-primary text-sm font-medium flex flex-col items-center gap-1">
                            <CheckCircle size={20} />
                            <span className="truncate w-full px-2">{kycAnverso.name}</span>
                          </div>
                        ) : (
                          <div className="text-muted-foreground group-hover:text-primary flex flex-col items-center">
                            <Upload size={24} className="mb-2" />
                            <span className="text-sm font-medium">Subir Anverso</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium">2. Reverso de tu CI</label>
                      <div className="relative border-2 border-dashed border-border rounded-lg p-6 hover:bg-muted/50 text-center cursor-pointer group">
                        <input 
                          type="file" 
                          accept="image/jpeg, image/png, image/webp"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          onChange={(e) => handleKycFileChange(e, setKycReverso)}
                        />
                        {kycReverso ? (
                          <div className="text-primary text-sm font-medium flex flex-col items-center gap-1">
                            <CheckCircle size={20} />
                            <span className="truncate w-full px-2">{kycReverso.name}</span>
                          </div>
                        ) : (
                          <div className="text-muted-foreground group-hover:text-primary flex flex-col items-center">
                            <Upload size={24} className="mb-2" />
                            <span className="text-sm font-medium">Subir Reverso</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {kycError && (
                    <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive flex gap-2">
                      <AlertTriangle size={16} /> <span>{kycError}</span>
                    </div>
                  )}

                  <Button onClick={handleKycSubmit} className="w-full" disabled={isKycUploading}>
                    {isKycUploading ? "Subiendo documentos..." : "Enviar para Verificación"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Verificaciones secundarias (Email, Phone) */}
    </div>
  );
}
