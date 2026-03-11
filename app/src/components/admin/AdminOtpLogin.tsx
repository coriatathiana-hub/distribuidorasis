import { useState } from "react";
import { Loader2, Mail, KeyRound, RefreshCw, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { requestOtp, verifyOtp } from "@/lib/supabase/auth";

type Step = "request" | "verify";

interface AdminOtpLoginProps {
  onSuccess: () => void;
}

const AdminOtpLogin = ({ onSuccess }: AdminOtpLoginProps) => {
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    const result = await requestOtp(email.trim().toLowerCase());
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setStep("verify");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (token.length < 6) return;
    setLoading(true);
    setError(null);
    const result = await verifyOtp(email.trim().toLowerCase(), token.trim());
    setLoading(false);
    if (result.error) {
      setError(result.error);
      setToken("");
    } else {
      onSuccess();
    }
  };

  const handleRetry = () => {
    setStep("request");
    setToken("");
    setError(null);
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-xl">Acceso Administrativo</CardTitle>
          <CardDescription>
            {step === "request"
              ? "Ingresa tu correo para recibir un código de acceso de un solo uso."
              : `Revisa tu correo ${email} e ingresa el código de 6 dígitos.`}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === "request" && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@ejemplo.com"
                    className="pl-9"
                    autoComplete="email"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !email.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando…
                  </>
                ) : (
                  "Solicitar código"
                )}
              </Button>
            </form>
          )}

          {step === "verify" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">Código de acceso (6 dígitos)</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="token"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={token}
                    onChange={(e) =>
                      setToken(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="123456"
                    className="pl-9 text-center tracking-[0.5em]"
                    autoComplete="one-time-code"
                    required
                    disabled={loading}
                    autoFocus
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading || token.length < 6}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando…
                  </>
                ) : (
                  "Verificar e ingresar"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-sm text-muted-foreground"
                onClick={handleRetry}
                disabled={loading}
              >
                <RefreshCw className="mr-2 h-3 w-3" />
                Solicitar nuevo código
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOtpLogin;
