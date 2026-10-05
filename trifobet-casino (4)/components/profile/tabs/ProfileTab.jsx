// components/profile/tabs/ProfileTab.jsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "lucide-react";

export function ProfileTab({ formData, setFormData, isEditing, accountStats }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-1 pb-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información Personal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombres">Nombre</Label>
              <Input
                id="nombres"
                value={formData.nombre || ""}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="apellido_1">Apellido 1</Label>
              <Input
                id="apellido_1"
                value={formData.apellido1 || ""}
                onChange={(e) => setFormData({ ...formData, apellido1: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="apellido_2">Apellido 2</Label>
              <Input
                id="apellido_2"
                value={formData.apellido2 || ""}
                onChange={(e) => setFormData({ ...formData, apellido2: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
              <Input
                id="fecha_nacimiento"
                type="date"
                value={formData.fecha_nacimiento || ""}
                onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                disabled={!isEditing || formData.verificado}
              />
            </div>
            <div>
              <Label htmlFor="correo">Email</Label>
              <Input
                id="correo"
                type="email"
                value={formData.correo || ""}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono || ""}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="numero_documento">Número de Documento (CI)</Label>
              <Input
                id="numero_documento"
                value={formData.ci || ""}
                onChange={(e) => setFormData({ ...formData, ci: e.target.value })}
                disabled={!isEditing || formData.verificado}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estadísticas de Cuenta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Miembro desde</p>
              <p className="font-bold">{accountStats.memberSince}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Depositado</p>
              <p className="font-bold text-green-600">Bs {accountStats.totalDeposits}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Retirado</p>
              <p className="font-bold text-blue-600">Bs {accountStats.totalWithdrawals}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Apuestas Realizadas</p>
              <p className="font-bold">{accountStats.totalBets}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tasa de Acierto</p>
              <p className="font-bold text-green-600">{accountStats.winRate}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Juego Favorito</p>
              <p className="font-medium">{accountStats.favoriteGame}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
