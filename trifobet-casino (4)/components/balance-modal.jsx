"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Gift,
  Zap,
  Shield,
  Info,
  QrCode,
  RefreshCw,
  Loader2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { saveAuth, getStoredUser, getStoredToken } from "@/lib/auth"
import { API_Back_Url as API_URL } from "@/lib/config"
import { apiGet } from "@/lib/api"

export default function BalanceModal({ isOpen, onClose, balance, onBalanceUpdate, onOpenYape }) {
  const router = useRouter()
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("")
  const [selectedBank, setSelectedBank] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [userWithdrawalAccounts, setUserWithdrawalAccounts] = useState([])
  const [transactionHistory, setTransactionHistory] = useState([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [activeTab, setActiveTab] = useState("deposit")
  const [retainedBalance, setRetainedBalance] = useState(0)
  const [cancelDialog, setCancelDialog] = useState({ isOpen: false, transactionId: null })
  const [withdrawDialog, setWithdrawDialog] = useState({ isOpen: false })
  const { toast } = useToast()

  // Fetch approved withdrawal accounts when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchAccounts = async () => {
        try {
          const token = localStorage.getItem('token')
          const res = await fetch(`${API_URL}/retiros/cuenta/mis-cuentas`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (res.ok) {
            const data = await res.json()
            // Filtrar solo cuentas aprobadas
            setUserWithdrawalAccounts(data.filter(a => a.estado === 'aprobada'))
          }
        } catch (error) {
          console.error("Error fetching withdrawal accounts", error)
        }
      }
      fetchAccounts()
    }
  }, [isOpen])

  const paymentMethods = [
    {
      id: "yape",
      name: "Yape",
      icon: Smartphone,
      description: "Pago instantáneo con QR",
      minAmount: 10,
      maxAmount: 5000,
      fee: "Gratis",
      processingTime: "Instantáneo",
      popular: true,
    }
  ]

  const withdrawalMethods = [
    {
      id: "bank_transfer",
      name: "Transferencia Bancaria",
      icon: Building2,
      description: "Retiro a tu cuenta bancaria",
      minAmount: 10,
      maxAmount: 50000,
      fee: "Gratis",
      processingTime: "1-3 días hábiles",
      requiresBank: true,
    },
    {
      id: "paypal",
      name: "PayPal",
      icon: Wallet,
      description: "Retiro a tu cuenta PayPal",
      minAmount: 10,
      maxAmount: 2500,
      fee: "2.9%",
      processingTime: "Instantáneo",
      requiresBank: false,
    },
    {
      id: "skrill",
      name: "Skrill",
      icon: Smartphone,
      description: "Retiro a tu cuenta Skrill",
      minAmount: 10,
      maxAmount: 10000,
      fee: "1.9%",
      processingTime: "Instantáneo",
      requiresBank: false,
    },
    {
      id: "neteller",
      name: "Neteller",
      icon: Smartphone,
      description: "Retiro a tu cuenta Neteller",
      minAmount: 10,
      maxAmount: 10000,
      fee: "1.9%",
      processingTime: "Instantáneo",
      requiresBank: false,
    },
  ]

  const banks = [
    { id: "santander", name: "Banco Santander" },
    { id: "bbva", name: "BBVA" },
    { id: "caixabank", name: "CaixaBank" },
    { id: "bankia", name: "Bankia" },
    { id: "sabadell", name: "Banco Sabadell" },
    { id: "bankinter", name: "Bankinter" },
    { id: "unicaja", name: "Unicaja Banco" },
    { id: "kutxabank", name: "Kutxabank" },
    { id: "abanca", name: "ABANCA" },
    { id: "cajamar", name: "Cajamar" },
    { id: "ibercaja", name: "Ibercaja" },
    { id: "liberbank", name: "Liberbank" },
  ]

  const fetchHistory = async () => {
    setIsLoadingHistory(true)
    try {
      const data = await apiGet('/transacciones/historial?tipo=deposito,retiro,recarga,abono&limit=50')
      console.log('HISTORY DATA:', data)
      let trans = data?.transacciones || (Array.isArray(data) ? data : [])
      
      // Filtrar solo retiros y depósitos (y variantes)
      const tiposValidos = ['deposito', 'retiro', 'recarga', 'abono']
      trans = trans.filter(t => tiposValidos.includes(t.tipo?.toLowerCase()))
      
      console.log('FILTERED TRANS:', trans)
      setTransactionHistory(trans)
      
      const pendingRetiros = trans
        .filter(t => t.tipo === 'retiro' && t.estado === 'pendiente')
        .reduce((acc, curr) => acc + Number(curr.monto), 0)
      setRetainedBalance(pendingRetiros)
    } catch (error) {
      console.error("Error fetching history:", error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchHistory()
    }
  }, [isOpen])

  const handleCancelWithdrawal = (id) => {
    setCancelDialog({ isOpen: true, transactionId: id })
  }

  const executeCancelWithdrawal = async () => {
    const id = cancelDialog.transactionId
    if (!id) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/retiros/usuario/cancelar/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        toast({ title: 'Retiro cancelado', description: 'El monto ha sido devuelto a tu saldo disponible.' })
        fetchHistory()
        window.dispatchEvent(new CustomEvent('balanceUpdated'))
      } else {
        const err = await res.json()
        toast({ title: 'Error', description: err.message || 'No se pudo cancelar el retiro', variant: 'destructive' })
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Error de conexión', variant: 'destructive' })
    } finally {
      setCancelDialog({ isOpen: false, transactionId: null })
    }
  }

  const executeWithdrawal = async () => {
    setIsProcessing(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/retiros/solicitar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          cuenta_retiro_id: selectedPaymentMethod,
          monto: parseFloat(withdrawAmount)
        })
      })
      if (res.ok) {
        toast({
          title: "Retiro solicitado",
          description: `Tu retiro de Bs ${withdrawAmount} está siendo procesado.`,
        })
        setWithdrawAmount("")
        fetchHistory()
        onClose()
        window.dispatchEvent(new CustomEvent("balanceUpdated"));
      } else {
        const err = await res.json()
        toast({ title: 'Error', description: err.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Error de conexión', variant: 'destructive' })
    } finally {
      setIsProcessing(false)
      setWithdrawDialog({ isOpen: false })
    }
  }

  const handleDeposit = async () => {
    if (!depositAmount || !selectedPaymentMethod) {
      toast({
        title: "Error",
        description: "Por favor selecciona un método de pago y monto",
        variant: "destructive",
      })
      return
    }

    const amount = Number.parseFloat(depositAmount)
    const method = paymentMethods.find((m) => m.id === selectedPaymentMethod)

    if (amount < method.minAmount || amount > method.maxAmount) {
      toast({
        title: "Error",
        description: `El monto debe estar entre Bs ${method.minAmount} y Bs ${method.maxAmount}`,
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    setTimeout(() => {
      const newBalance = balance + amount
      onBalanceUpdate(newBalance)

      const user = getStoredUser()
      const token = getStoredToken()
      if (user && token) {
        const updatedUser = { ...user, saldo: newBalance }
        saveAuth(token, updatedUser)
      }

      setIsProcessing(false)
      setDepositAmount("")
      setSelectedPaymentMethod("")

      window.dispatchEvent(new CustomEvent('balance-updated'))

      toast({
        title: "¡Depósito exitoso!",
        description: `Se han agregado Bs ${amount} a tu cuenta usando ${method.name}`,
      })
    }, 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <DollarSign className="h-6 w-6 text-green-600" />
            Gestión de Saldo
          </DialogTitle>
          <DialogDescription>Deposita o retira fondos de forma segura y rápida</DialogDescription>
        </DialogHeader>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Saldo Disponible</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-400">Bs {balance.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Saldo Retenido</p>
                <p className="text-lg font-semibold text-muted-foreground">Bs {retainedBalance.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="deposit" className="h-full flex flex-col" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="deposit" className="flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4" />
                Depositar
              </TabsTrigger>
              <TabsTrigger value="withdraw" className="flex items-center gap-2">
                <ArrowDownLeft className="h-4 w-4" />
                Retirar
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Historial
              </TabsTrigger>
            </TabsList>

            <TabsContent value="deposit" className="flex-1 overflow-hidden h-full">
              <ScrollArea className="h-[calc(100vh-350px)]">
                <div className="p-1 pb-6 space-y-6">
                  <Card className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-500/30 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <QrCode className="w-24 h-24" />
                    </div>
                    <CardContent className="p-6 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-violet-500 hover:bg-violet-600 text-white">¡Nuevo!</Badge>
                          <h3 className="font-bold text-lg text-foreground">Recarga Automática con Yape</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">Escanea el QR y tu saldo se acreditará en minutos. Sin comisiones.</p>
                      </div>
                      <Button 
                        onClick={() => {
                          onClose();
                          window.dispatchEvent(new CustomEvent('open-yape-modal'));
                        }}
                        className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-lg shadow-violet-500/20"
                      >
                        <QrCode className="w-4 h-4 mr-2" />
                        Ir a Recarga Yape
                      </Button>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-4">Métodos de Pago</h3>
                      <div className="space-y-3">
                        {paymentMethods.map((method) => (
                          <Card
                            key={method.id}
                            className={`cursor-pointer transition-all duration-200 ${selectedPaymentMethod === method.id
                              ? "border-primary bg-primary/5"
                              : "hover:border-primary/50"
                              }`}
                            onClick={() => setSelectedPaymentMethod(method.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="bg-muted p-2 rounded-lg">
                                    <method.icon className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{method.name}</span>
                                      {method.popular && (
                                        <Badge className="bg-orange-100 text-orange-800 text-xs">Popular</Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{method.description}</p>
                                  </div>
                                </div>
                                <div className="text-right text-xs text-muted-foreground">
                                  <div>Comisión: {method.fee}</div>
                                  <div>{method.processingTime}</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col h-full justify-center">
                      <div className="text-center space-y-6">
                        <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <QrCode className="h-10 w-10 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-xl mb-2">Recarga Rápida con Yape</h3>
                          <p className="text-muted-foreground mb-6">
                            Escanea nuestro código QR de Yape desde tu celular y recarga tu cuenta al instante sin comisiones.
                          </p>
                        </div>
                        
                        <Button
                          onClick={() => {
                            if (onOpenYape) onOpenYape();
                          }}
                          className="w-full h-12 text-lg"
                        >
                          <QrCode className="h-5 w-5 mr-2" />
                          Abrir recarga con Yape
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="withdraw" className="flex-1 overflow-hidden h-full">
              <ScrollArea className="h-[calc(100vh-350px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-1 pb-6">
                  <div>
                    <h3 className="font-semibold mb-4">Mis Cuentas de Retiro Aprobadas</h3>
                    <div className="space-y-3">
                      {userWithdrawalAccounts.length === 0 ? (
                        <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground text-sm">
                          No tienes cuentas de retiro aprobadas.
                        </div>
                      ) : (
                        userWithdrawalAccounts.map((account) => (
                          <Card
                            key={account.id}
                            className={`cursor-pointer transition-all duration-200 ${selectedPaymentMethod === account.id
                              ? "border-primary bg-primary/5"
                              : "hover:border-primary/50"
                              }`}
                            onClick={() => setSelectedPaymentMethod(account.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="bg-muted p-2 rounded-lg">
                                    <Smartphone className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <span className="font-bold uppercase text-blue-500">{account.billetera}</span>
                                    <p className="text-sm font-mono">{account.numero_cuenta}</p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Monto a Retirar</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="withdraw-amount">Monto</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                            Bs
                          </span>
                          <Input
                            id="withdraw-amount"
                            type="number"
                            placeholder="0.00"
                            value={withdrawAmount}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val.includes('-')) return;
                              setWithdrawAmount(val);
                            }}
                            onKeyDown={(e) => {
                              if (['-', '+', 'e', 'E'].includes(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            className="pl-10"
                            step="0.01"
                            min="0"
                            max={balance}
                          />
                        </div>
                        {withdrawAmount && parseFloat(withdrawAmount) < 10 && (
                          <p className="text-red-500 text-xs mt-1">El monto mínimo de retiro es Bs 10</p>
                        )}
                        {withdrawAmount && parseFloat(withdrawAmount) > 15000 && (
                          <p className="text-red-500 text-xs mt-1">El monto máximo de retiro es Bs 15,000</p>
                        )}
                        {withdrawAmount && parseFloat(withdrawAmount) > balance && (
                          <p className="text-red-500 text-xs mt-1">Saldo insuficiente</p>
                        )}
                      </div>
                      <Button
                        onClick={() => {
                          if (!selectedPaymentMethod || !withdrawAmount) return
                          const amount = parseFloat(withdrawAmount);
                          if (amount < 10) {
                            toast({ title: "Error", description: "El monto mínimo de retiro es Bs 10", variant: "destructive" });
                            return;
                          }
                          if (amount > 15000) {
                            toast({ title: "Error", description: "El monto máximo de retiro es Bs 15,000", variant: "destructive" });
                            return;
                          }
                          setWithdrawDialog({ isOpen: true })
                        }}
                        className="w-full h-12"
                        disabled={
                          !withdrawAmount || 
                          !selectedPaymentMethod || 
                          parseFloat(withdrawAmount) < 10 || 
                          parseFloat(withdrawAmount) > 15000 || 
                          parseFloat(withdrawAmount) > balance || 
                          isProcessing
                        }
                      >
                        {isProcessing ? "Procesando..." : "Retirar"}
                      </Button>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="history" className="flex-1 overflow-hidden h-full">
              <ScrollArea className="h-[calc(100vh-350px)]">
                <div className="p-1 pb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Historial de Transacciones</h3>
                    <Button variant="ghost" size="sm" onClick={fetchHistory} disabled={isLoadingHistory}>
                      <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingHistory ? 'animate-spin' : ''}`} /> Actualizar
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {isLoadingHistory ? (
                      <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground w-8 h-8" /></div>
                    ) : transactionHistory.length === 0 ? (
                      <p className="text-center text-muted-foreground p-8">No hay transacciones recientes.</p>
                    ) : (
                      transactionHistory.map((transaction) => (
                        <Card key={transaction.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`p-2 rounded-lg ${transaction.tipo === "deposito" || transaction.tipo === "recarga" || transaction.tipo === "abono"
                                    ? "bg-green-100 dark:bg-green-900/20"
                                    : "bg-red-100 dark:bg-red-900/20"
                                    }`}
                                >
                                  {transaction.tipo === "deposito" || transaction.tipo === "recarga" || transaction.tipo === "abono" ? (
                                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <ArrowDownLeft className="h-4 w-4 text-red-600" />
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium capitalize">
                                      {transaction.tipo}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className={`${transaction.estado === "completado" || transaction.estado === "aprobada" || transaction.estado === "aprobado"
                                        ? "text-green-500 border-green-500"
                                        : transaction.estado === "pendiente"
                                          ? "text-yellow-500 border-yellow-500"
                                          : "text-red-500 border-red-500"
                                        }`}
                                    >
                                      {transaction.estado}
                                    </Badge>
                                  </div>
                                  <div className="text-sm text-muted-foreground mt-1 flex flex-col gap-0.5">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {new Date(transaction.fechaCreacion || transaction.fecha_creacion).toLocaleString('es-BO')}
                                    </span>
                                    <span className="text-xs">Ref: TXN{String(transaction.id).padStart(6, '0')}</span>
                                    {transaction.tipo === 'retiro' && transaction.estado === 'pendiente' && (
                                      <Button 
                                        variant="destructive" 
                                        size="sm" 
                                        className="h-6 text-xs mt-1 w-fit px-2"
                                        onClick={() => handleCancelWithdrawal(transaction.id)}
                                      >
                                        Cancelar Retiro
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div
                                className={`font-bold ${transaction.tipo === "deposito" || transaction.tipo === "recarga" || transaction.tipo === "abono"
                                  ? "text-green-500"
                                  : "text-foreground"
                                  }`}
                              >
                                {transaction.tipo === "deposito" || transaction.tipo === "recarga" || transaction.tipo === "abono" ? "+" : "-"}Bs{" "}
                                {Number(transaction.monto).toFixed(2)}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )))}
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>

      {/* Diálogo de confirmación para Retiro */}
      <AlertDialog open={withdrawDialog.isOpen} onOpenChange={(open) => setWithdrawDialog({ isOpen: open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Retiro</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas retirar Bs {withdrawAmount} a la cuenta seleccionada? 
              Este monto será descontado de tu saldo disponible y pasará a tu saldo retenido hasta que sea procesado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={executeWithdrawal} disabled={isProcessing} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {isProcessing ? "Procesando..." : "Sí, retirar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de confirmación para Cancelar Retiro */}
      <AlertDialog open={cancelDialog.isOpen} onOpenChange={(open) => setCancelDialog({ ...cancelDialog, isOpen: open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Retiro</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas cancelar este retiro? El monto retenido será devuelto inmediatamente a tu saldo disponible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={executeCancelWithdrawal} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sí, cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}