// components/profile-modal.jsx
"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Eye, Camera, Settings, LogOut } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

// Hooks
import { useProfileLogic } from "./profile/hooks/useProfileLogic";

// Tabs
import { ProfileTab } from "./profile/tabs/ProfileTab";
import { SecurityTab } from "./profile/tabs/SecurityTab";
import { VerificationTab } from "./profile/tabs/VerificationTab";
import { ActivityTab } from "./profile/tabs/ActivityTab";
import { BetsTab } from "./profile/tabs/BetsTab";
import { ProfileRetirosTab } from "./profile-retiros-tab";

export default function ProfileModal({ isOpen, onClose, userData = {}, onUserDataUpdate, onLogout }) {
  const [activeTab, setActiveTab] = useState("profile");
  const { toast } = useToast();

  const {
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
  } = useProfileLogic(userData, onUserDataUpdate);

  useEffect(() => {
    if (isOpen) fetchUserData();
  }, [isOpen, fetchUserData]);

  const handleClose = () => {
    if (hasChanges) {
      onUserDataUpdate({
        ...userData,
        nombre: formData.nombre,
        apellido1: formData.apellido1,
        apellido2: formData.apellido2,
        correo: formData.correo,
        telefono: formData.telefono,
        foto_perfil_url: formData.foto_perfil_url,
        saldo: formData.saldo,
        name: `${formData.nombre || ""} ${formData.apellido1 || ""} ${formData.apellido2 || ""}`.trim() || "Usuario Anónimo",
      });
    }
    setIsEditing(false);
    setHasChanges(false);
    onClose();
  };

  const handleSaveChanges = async () => {
    if (activeTab === "profile") {
      await handleSaveProfile();
    } else {
      toast({ title: "Advertencia", description: "No hay cambios para guardar en esta pestaña" });
      setIsEditing(false);
    }
  };

  const accountStats = formData.stats || {
    memberSince: formData.fecha_creacion ? new Date(formData.fecha_creacion).toLocaleDateString() : "N/A",
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalBets: 0,
    winRate: 0,
    favoriteGame: "N/A",
  };

  const recentActivity = formData.actividad_reciente || [];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <User className="h-6 w-6 text-primary" /> Mi Perfil
            </DialogTitle>
            <DialogDescription>Gestiona tu información personal, configuración y seguridad</DialogDescription>
          </DialogHeader>

          {/* Profile Header */}
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="cursor-pointer" onClick={() => setShowPhotoModal(true)}>
                    <Image
                      src={formData.foto_perfil_url || "/placeholder-user.jpg"}
                      alt={formData.nombre || "Usuario"}
                      width={80} height={80}
                      className="rounded-full border-4 border-white shadow-lg object-cover"
                    />
                  </div>
                  <Button
                    size="icon"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                    variant="secondary"
                    onClick={() => {
                      const fileInput = document.createElement("input");
                      fileInput.type = "file";
                      fileInput.accept = "image/*";
                      fileInput.onchange = handleUploadPhoto;
                      fileInput.click();
                    }}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold">{`${formData.nombre || ""} ${formData.apellido1 || ""}`.trim() || "Usuario Anónimo"}</h3>
                  <p className="text-muted-foreground">{formData.correo || "Sin correo"}</p>
                  <Badge variant="outline" className="text-green-600 border-green-600 mt-2">Saldo: Bs {(formData.saldo || 0).toFixed(2)}</Badge>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                    <Settings className="h-4 w-4 mr-2" /> {isEditing ? "Cancelar" : "Editar"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { onLogout(); handleClose(); }} className="text-destructive">
                    <LogOut className="h-3 w-3 mr-1" /> Cerrar Sesión
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex-1 overflow-auto min-h-0">
            <Tabs defaultValue="profile" className="flex flex-col h-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6 shrink-0 overflow-x-auto">
                <TabsTrigger value="profile">Perfil</TabsTrigger>
                <TabsTrigger value="retiros">Retiros</TabsTrigger>
                <TabsTrigger value="bets">Apuestas</TabsTrigger>
                <TabsTrigger value="security">Seguridad</TabsTrigger>
                <TabsTrigger value="verification">Verificación</TabsTrigger>
                <TabsTrigger value="activity">Actividad</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="flex-1 overflow-hidden h-full">
                <ScrollArea className="h-[calc(100vh-350px)]">
                  <ProfileTab formData={formData} setFormData={setFormData} isEditing={isEditing} accountStats={accountStats} />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="retiros" className="flex-1 overflow-hidden h-full">
                <ScrollArea className="h-[calc(100vh-350px)]">
                  <ProfileRetirosTab userId={formData.id} />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="bets" className="flex-1 overflow-hidden h-full">
                <ScrollArea className="h-[calc(100vh-350px)]">
                  <BetsTab />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="security" className="flex-1 overflow-hidden h-full">
                <ScrollArea className="h-[calc(100vh-350px)]">
                  <SecurityTab isEditing={isEditing} formData={formData} />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="verification" className="flex-1 overflow-hidden h-full">
                <ScrollArea className="h-[calc(100vh-350px)]">
                  <VerificationTab formData={formData} />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="activity" className="flex-1 overflow-hidden h-full">
                <ScrollArea className="h-[calc(100vh-350px)]">
                  <ActivityTab recentActivity={recentActivity} />
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          {isEditing && activeTab === "profile" && (
            <div className="flex justify-end gap-2 pt-3 border-t shrink-0">
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
              <Button onClick={handleSaveChanges}>Guardar Cambios</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showPhotoModal} onOpenChange={setShowPhotoModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Foto de Perfil</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-4">
            <Image src={formData.foto_perfil_url || "/placeholder-user.jpg"} alt="Foto" width={500} height={500} className="rounded-lg object-cover" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
