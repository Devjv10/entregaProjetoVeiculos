import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, Check, Route, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { api, errorMessage } from "../services/api";
import { Brand } from "../components/UI";

const schema = z.object({
  name: z.string().optional(),
  email: z.string().email("Informe um e-mail válido."),
  password: z.string().min(8, "Use pelo menos 8 caracteres.").max(72),
  confirmation: z.string().optional(),
});
type Fields = z.infer<typeof schema>;

export function AuthPage({ registerMode = false }: { registerMode?: boolean }) {
  const { user, acceptSession } = useAuth();
  const navigate = useNavigate();
  const validation = schema.superRefine((data, ctx) => {
    if (registerMode && (!data.name || data.name.trim().length < 2))
      ctx.addIssue({
        code: "custom",
        path: ["name"],
        message: "Informe seu nome completo.",
      });
    if (registerMode && data.password !== data.confirmation)
      ctx.addIssue({
        code: "custom",
        path: ["confirmation"],
        message: "As senhas não coincidem.",
      });
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Fields>({ resolver: zodResolver(validation) });
  if (user) return <Navigate to="/" replace />;
  async function submit(values: Fields) {
    try {
      const payload = registerMode
        ? { name: values.name, email: values.email, password: values.password }
        : { email: values.email, password: values.password };
      const response = await api.post(
        `/auth/${registerMode ? "register" : "login"}`,
        payload,
      );
      acceptSession(response.data.data);
      toast.success(
        registerMode
          ? "Conta criada. Bem-vindo ao DriveFlow!"
          : "Bem-vindo de volta!",
      );
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }
  return (
    <div className="auth-shell">
      <section className="auth-story">
        <Brand />
        <div className="auth-story-content">
          <span className="auth-tag">
            <span /> MOBILIDADE SEM COMPLICAÇÃO
          </span>
          <h1>
            Seu próximo
            <br />
            caminho começa
            <br />
            <em>aqui.</em>
          </h1>
          <p>
            Mais liberdade para ir.
            <br />
            Mais simplicidade para alugar.
          </p>
          <div className="journey-art" aria-hidden="true">
            <div className="journey-line" />
            <div className="journey-point start" />
            <div className="journey-point finish">
              <Route size={32} />
            </div>
            <span>Um novo destino espera por você</span>
          </div>
        </div>
        <div className="auth-trust">
          <ShieldCheck size={20} /> Gestão simples. Viagens tranquilas.
        </div>
      </section>
      <section className="auth-form-side">
        <div className="auth-mobile-brand">
          <Brand />
        </div>
        <div className="auth-form-wrap">
          <span className="eyebrow">BEM-VINDO AO DRIVEFLOW</span>
          <h2>{registerMode ? "Vamos começar?" : "Bom ter você por aqui."}</h2>
          <p className="muted">
            {registerMode
              ? "Crie sua conta e encontre o veículo para o seu próximo destino."
              : "Acesse sua conta para continuar sua jornada."}
          </p>
          <form onSubmit={handleSubmit(submit)} noValidate>
            {registerMode && (
              <label>
                Nome completo
                <input
                  autoComplete="name"
                  placeholder="Como podemos chamar você?"
                  {...register("name")}
                />
                <span className="field-error">{errors.name?.message}</span>
              </label>
            )}
            <label>
              E-mail
              <input
                type="email"
                autoComplete="email"
                placeholder="voce@exemplo.com"
                {...register("email")}
              />
              <span className="field-error">{errors.email?.message}</span>
            </label>
            <label>
              Senha
              <input
                type="password"
                autoComplete={
                  registerMode ? "new-password" : "current-password"
                }
                placeholder={
                  registerMode ? "Pelo menos 8 caracteres" : "Digite sua senha"
                }
                {...register("password")}
              />
              <span className="field-error">{errors.password?.message}</span>
            </label>
            {registerMode && (
              <label>
                Confirmar senha
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Digite sua senha novamente"
                  {...register("confirmation")}
                />
                <span className="field-error">
                  {errors.confirmation?.message}
                </span>
              </label>
            )}
            <button className="btn primary full" disabled={isSubmitting}>
              {isSubmitting
                ? "Aguarde…"
                : registerMode
                  ? "Criar minha conta"
                  : "Entrar na minha conta"}
              <ArrowRight size={18} />
            </button>
          </form>
          <p className="auth-switch">
            {registerMode ? "Já tem uma conta?" : "Ainda não tem uma conta?"}{" "}
            <Link to={registerMode ? "/login" : "/cadastro"}>
              {registerMode ? "Entrar" : "Cadastre-se"}
            </Link>
          </p>
          <div className="auth-note">
            <Check size={16} /> Seus dados protegidos, sua viagem organizada.
          </div>
        </div>
        <small className="auth-copyright">
          DriveFlow — Sistema de Locação de Veículos
        </small>
      </section>
    </div>
  );
}
