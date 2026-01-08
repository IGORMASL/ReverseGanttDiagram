// src/pages/AuthPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import { loginApi, registerApi, saveToken } from "../api/auth";
import { getProfile } from "../api/users";
import { getErrorMessage } from "../utils/errorHandling";

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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
  }>({});
  const navigate = useNavigate();

  const validate = (): boolean => {
    const errors: typeof fieldErrors = {};

    if (!email.trim()) {
      errors.email = "Укажите email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Некорректный email";
    }

    if (!password.trim()) {
      errors.password = "Введите пароль";
    } else if (password.length < 6) {
      errors.password = "Пароль должен быть не короче 6 символов";
    }

    if (mode === "register") {
      if (!firstName.trim()) {
        errors.firstName = "Укажите имя";
      }
      if (!lastName.trim()) {
        errors.lastName = "Укажите фамилию";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setSubmitError(null);

    const isValid = validate();
    if (!isValid) {
      return;
    }

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
      const message = getErrorMessage(err);
      setSubmitError(message || "Не удалось выполнить запрос. Попробуйте ещё раз.");
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
          <h2 className="text-2xl font-semibold text-black mb-4 text-center">{mode === "login" ? "Войти" : "Регистрация"}</h2>

          {submitError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {submitError}
            </div>
          )}

          {mode === "register" && (
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Имя"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={fieldErrors.firstName ? "border-red-500 focus:ring-red-500" : ""}
                />
                {fieldErrors.firstName && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.firstName}</p>
                )}
              </div>
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Фамилия"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={fieldErrors.lastName ? "border-red-500 focus:ring-red-500" : ""}
                />
                {fieldErrors.lastName && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.lastName}</p>
                )}
              </div>
            </div>
          )}

          <div className="mb-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldErrors.email ? "border-red-500 focus:ring-red-500" : ""}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          <div className="mb-4">
            <Input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldErrors.password ? "border-red-500 focus:ring-red-500" : ""}
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
            )}
          </div>

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
