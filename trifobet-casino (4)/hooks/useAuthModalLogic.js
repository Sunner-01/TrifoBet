// hooks/useAuthModalLogic.js
// Extraemos toda la lógica de autenticación y estado del modal (SRP)
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { API_Back_Url as API_URL } from "@/lib/config";
import { saveAuth } from "@/lib/auth";

export function useAuthModalLogic({ defaultTab, onLogin, onClose }) {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [registerStep, setRegisterStep] = useState(1);
  const [credentials, setCredentials] = useState({ usuario: "", contrasena: "" });
  const [registerData, setRegisterData] = useState({ usuario: "", email: "", password: "", firstName: "", lastName: "", secondLastName: "", ci: "", dob: "", phone: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [step1Error, setStep1Error] = useState(null);
  const [step2Error, setStep2Error] = useState(null);
  
  const [paises, setPaises] = useState([]);
  const [paisSeleccionado, setPaisSeleccionado] = useState("BO");
  const [loadingPaises, setLoadingPaises] = useState(false);
  
  const formRef = useRef(null);
  const { toast } = useToast();

  // Ya no cargamos países dinámicamente, forzamos Bolivia
  useEffect(() => {
    // Retenido por si se necesita después, pero inactivo
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(null);
    try {
      const body = { contrasena: credentials.contrasena };
      const identificadorLimpio = credentials.usuario.trim();
      if (identificadorLimpio.includes("@")) {
        body.correo = identificadorLimpio;
      } else {
        body.nombreUsuario = identificadorLimpio;
      }

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok && data.access_token) {
        saveAuth(data.access_token, data.usuario);
        if (onLogin) onLogin(data.usuario);
        onClose();
        toast({ title: "¡Bienvenido!", description: "Sesión iniciada correctamente" });
      } else {
        const errorMsg = Array.isArray(data.message) ? data.message.join(", ") : (data.message || "Credenciales incorrectas");
        setLoginError(errorMsg);
      }
    } catch (error) {
      setLoginError("No se pudo conectar al servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterNext = (e) => {
    e.preventDefault();
    setStep1Error(null);
    const usuario = e.target["usuario-register"].value.trim();
    const email = e.target["email-register"].value.trim();
    const password = e.target["password-register"].value;
    const confirmPassword = e.target["confirm-password"].value;

    if (!usuario || !email || !password || !confirmPassword) {
      setStep1Error("Todos los campos son obligatorios");
      return;
    }
    if (password !== confirmPassword) {
      setStep1Error("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 6) {
      setStep1Error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    const pwdRegex = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
    if (!pwdRegex.test(password)) {
      setStep1Error("La contraseña debe tener mayúscula, minúscula y número");
      return;
    }

    setRegisterData(prev => ({ ...prev, usuario, email, password }));
    setRegisterStep(2);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setStep2Error(null);
    const nombreVal = registerData.firstName.trim();
    const apellido1Val = registerData.lastName.trim();
    const apellido2Val = registerData.secondLastName.trim();
    const fechaNacimiento = registerData.dob;
    const phoneVal = registerData.phone.trim();
    const ciVal = registerData.ci.trim();
    
    if (!nombreVal || !apellido1Val) {
      setStep2Error("El nombre y el primer apellido son obligatorios");
      return;
    }
    
    if (nombreVal.length < 3 || apellido1Val.length < 3) {
      setStep2Error("El nombre y apellido deben tener al menos 3 caracteres");
      return;
    }
    
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombreVal) || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(apellido1Val)) {
      setStep2Error("El nombre y apellido solo pueden contener letras");
      return;
    }

    if (apellido2Val && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(apellido2Val)) {
      setStep2Error("El segundo apellido solo puede contener letras");
      return;
    }

    if (!/^[67][0-9]{7}$/.test(phoneVal)) {
      setStep2Error("El teléfono debe empezar con 6 o 7 y tener exactamente 8 dígitos");
      return;
    }

    if (!ciVal || !/^[0-9]{5,10}$/.test(ciVal)) {
      setStep2Error("El número de documento (CI) es inválido");
      return;
    }
    
    // Frontend Age Validation
    const dob = new Date(fechaNacimiento);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    if (age < 18) {
      setStep2Error("Debes ser mayor de 18 años para registrarte");
      return;
    }

    const payload = {
      nombre: nombreVal,
      apellido1: apellido1Val,
      apellido2: apellido2Val,
      ci: ciVal,
      fechaNacimiento: fechaNacimiento,
      nombreUsuario: registerData.usuario,
      correo: registerData.email,
      telefono: "+591" + phoneVal,
      contrasena: registerData.password,
      paisCodigo: "BO",
    };

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.status === 201 || response.ok) {
        toast({ title: "¡Cuenta creada!", description: "Iniciando sesión..." });

        const loginRes = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombreUsuario: registerData.usuario,
            contrasena: registerData.password,
          }),
        });

        const loginData = await loginRes.json();
        if (loginRes.ok) {
          saveAuth(loginData.access_token, loginData.usuario);
          if (onLogin) onLogin(loginData.usuario);
          onClose();
        }
      } else {
        const errorMsg = Array.isArray(data.message) ? data.message.join("\n") : (data.message || "Usuario o correo ya existen");
        setStep2Error(errorMsg);
      }
    } catch (error) {
      setStep2Error("Error de conexión al servidor");
    }
  };

  const resetState = () => {
    setRegisterStep(1);
    setShowPassword(false);
    setCredentials({ usuario: "", contrasena: "" });
    setRegisterData({ usuario: "", email: "", password: "", firstName: "", lastName: "", secondLastName: "", ci: "", dob: "", phone: "" });
    setStep1Error(null);
    setStep2Error(null);
    formRef.current?.reset();
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    resetState();
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetState, 300);
  };

  return {
    showPassword, setShowPassword,
    activeTab, handleTabChange,
    registerStep, setRegisterStep,
    credentials, setCredentials,
    isLoading, loginError, step1Error, step2Error, setStep2Error,
    paises, paisSeleccionado, setPaisSeleccionado, loadingPaises,
    handleLogin, handleRegisterNext, handleRegister, handleClose,
    formRef, registerData, setRegisterData
  };
}
