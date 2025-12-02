// src/pages/AuthPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import { loginApi, registerApi, saveToken } from "../api/auth";
import { getProfile } from "../api/users";

type AuthMode = "login" | "register";

function buildAuthPayload(mode: AuthMode, params: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  const { email, password, firstName, lastName } = params;

  if (mode === "register") {
    return {
      fullName: `${firstName} ${lastName}`.trim(),
      email,
      password,
    };
  }

  return { email, password };
}

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const body = buildAuthPayload(mode, { email, password, firstName, lastName });

    try {
      const data =
        mode === "register"
          ? await registerApi(body as any)
          : await loginApi(body as any);

      // сохраняем токен
      saveToken(data.token, data.expiresAt);

      // запрашиваем профиль и сохраняем системную роль и имя
      try {
        const profile = await getProfile();
        localStorage.setItem("fullName", profile.fullName);
        // system role: 0 = user, 1 = admin
        localStorage.setItem("systemRole", profile.role === 1 ? "Admin" : "User");
      } catch (e) {
        console.warn("Не удалось получить профиль сразу после login/register", e);
      }

      // переход на страницу классов
      navigate("/classes");
    } catch (err: any) {
      const message = err?.response?.data?.message ?? (err?.message ?? "Ошибка");
      alert(message);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-4">
      <div className="mt-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-black">Реверсивная диаграмма Ганта</h1>
      </div>

      <div className="flex-1 flex items-center justify-center w-full max-w-md mt-12 mb-20">
        <div className="bg-gray-100 p-8 rounded-2xl shadow-md w-full">
          <h2 className="text-2xl font-semibold text-black mb-6 text-center">{mode === "login" ? "Войти" : "Регистрация"}</h2>

          {mode === "register" && (
            <div className="flex gap-4 mb-4">
              <Input type="text" placeholder="Имя" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              <Input type="text" placeholder="Фамилия" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          )}

          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="mb-4" />
          <Input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} className="mb-4" />

          <Button onClick={handleSubmit}>{mode === "login" ? "Войти" : "Зарегистрироваться"}</Button>

          <p className="text-center text-sm text-black mt-4">
            {mode === "login" ? (
              <>Нет аккаунта? <button onClick={() => setMode("register")} className="underline">Зарегистрироваться</button></>
            ) : (
              <>Уже есть аккаунт? <button onClick={() => setMode("login")} className="underline">Войти</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
