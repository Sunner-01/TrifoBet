"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Facebook, Github } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState(1)

  // Formularios controlados
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [ci, setCi] = useState("")
  const [dob, setDob] = useState("")
  
  const [errors, setErrors] = useState({})

  const validateStep1 = () => {
    const newErrors = {}
    if (!email || !/\S+@\S+\.\S+/.test(email)) newErrors.email = "Correo electrónico inválido"
    if (!password || password.length < 8) newErrors.password = "Debe tener al menos 8 caracteres"
    if (password !== confirmPassword) newErrors.confirmPassword = "Las contraseñas no coinciden"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}
    
    if (!firstName || firstName.length < 3 || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(firstName)) {
      newErrors.firstName = "El nombre debe tener al menos 3 caracteres y solo letras"
    }
    if (!lastName || lastName.length < 3 || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(lastName)) {
      newErrors.lastName = "El apellido debe tener al menos 3 caracteres y solo letras"
    }
    if (!phone || !/^[67][0-9]{7}$/.test(phone)) {
      newErrors.phone = "El teléfono debe empezar con 6 o 7 y tener exactamente 8 dígitos"
    }
    if (!ci || !/^[0-9]{5,10}$/.test(ci)) {
      newErrors.ci = "Carnet de Identidad inválido (5 a 10 dígitos)"
    }
    
    if (!dob) {
      newErrors.dob = "Fecha de nacimiento requerida"
    } else {
      const age = new Date().getFullYear() - new Date(dob).getFullYear()
      if (age < 18) newErrors.dob = "Debes ser mayor de 18 años"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNextStep = (e) => {
    e.preventDefault()
    if (validateStep1()) {
      setStep(2)
      setErrors({})
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateStep2()) {
      console.log("Form submitted", { email, password, firstName, lastName, phone, ci, dob })
      // Handle registration logic
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Crear una cuenta</CardTitle>
          <CardDescription className="text-center">Regístrate para comenzar a jugar en TrifoBet</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleNextStep}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="nombre@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}</span>
                    </Button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
                  {!errors.password && (
                    <p className="text-xs text-muted-foreground">
                      La contraseña debe tener al menos 8 caracteres, incluyendo una letra mayúscula y un número.
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}
                </div>
                <Button type="submit" className="w-full">
                  Continuar
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="first-name">Nombre</Label>
                    <Input id="first-name" placeholder="Sunner" value={firstName} onChange={(e) => {
                      setFirstName(e.target.value)
                      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(e.target.value)) {
                        setErrors(prev => ({...prev, firstName: "Solo letras"}))
                      } else {
                        setErrors(prev => ({...prev, firstName: null}))
                      }
                    }} required />
                    {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="last-name">Apellido</Label>
                    <Input id="last-name" placeholder="Barrera" value={lastName} onChange={(e) => {
                      setLastName(e.target.value)
                      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(e.target.value)) {
                        setErrors(prev => ({...prev, lastName: "Solo letras"}))
                      } else {
                        setErrors(prev => ({...prev, lastName: null}))
                      }
                    }} required />
                    {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName}</p>}
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="ci">Carnet de Identidad (CI)</Label>
                  <Input 
                    id="ci" 
                    type="text" 
                    placeholder="Ej: 1234567" 
                    value={ci} 
                    maxLength={10}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '')
                      setCi(val)
                      if (val && !/^[0-9]{5,10}$/.test(val)) {
                        setErrors(prev => ({...prev, ci: "CI inválido (5 a 10 dígitos)"}))
                      } else {
                        setErrors(prev => ({...prev, ci: null}))
                      }
                    }} 
                    onKeyDown={(e) => {
                      if (['e', 'E', '+', '-', '.', ','].includes(e.key)) e.preventDefault()
                    }}
                    required 
                  />
                  {errors.ci && <p className="text-red-500 text-xs">{errors.ci}</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="Ej: 67614221" 
                    value={phone} 
                    maxLength={8}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '')
                      setPhone(val)
                      if (val && !/^[67][0-9]{7}$/.test(val)) {
                        setErrors(prev => ({...prev, phone: "Debe empezar con 6 o 7 y tener 8 dígitos"}))
                      } else {
                        setErrors(prev => ({...prev, phone: null}))
                      }
                    }} 
                    onKeyDown={(e) => {
                      if (['e', 'E', '+', '-', '.', ','].includes(e.key)) e.preventDefault()
                    }}
                    required 
                  />
                  {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="dob">Fecha de Nacimiento</Label>
                  <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
                  {errors.dob && <p className="text-red-500 text-xs">{errors.dob}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="country">País</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu país" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Bolivia</SelectItem>
                      <SelectItem value="mx">México</SelectItem>
                      <SelectItem value="ar">Argentina</SelectItem>
                      <SelectItem value="co">Colombia</SelectItem>
                      <SelectItem value="cl">Chile</SelectItem>
                      <SelectItem value="pe">Perú</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" required />
                  <Label htmlFor="terms" className="text-sm">
                    Acepto los{" "}
                    <Link href="/terminos" className="text-primary underline-offset-4 hover:underline">
                      términos y condiciones
                    </Link>{" "}
                    y la{" "}
                    <Link href="/privacidad" className="text-primary underline-offset-4 hover:underline">
                      política de privacidad
                    </Link>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="age" required />
                  <Label htmlFor="age" className="text-sm">
                    Confirmo que soy mayor de 18 años
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="marketing" />
                  <Label htmlFor="marketing" className="text-sm">
                    Deseo recibir ofertas y promociones por email
                  </Label>
                </div>
                <div className="flex gap-4">
                  <Button type="button" variant="outline" className="w-full" onClick={() => setStep(1)}>
                    Atrás
                  </Button>
                  <Button type="submit" className="w-full">
                    Registrarse
                  </Button>
                </div>
              </div>
            </form>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">O registrarse con</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="w-full">
              <Facebook className="mr-2 h-4 w-4" />
              Facebook
            </Button>
            <Button variant="outline" className="w-full">
              <Github className="mr-2 h-4 w-4" />
              Google
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-center text-sm text-muted-foreground mt-2">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Iniciar Sesión
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}