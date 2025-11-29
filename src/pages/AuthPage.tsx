import { useState } from "react"
import Input from "../components/Input"
import Button from "../components/Button"

export default function AuthPage() {
    const [mode, setMode] = useState<"login" | "register">("login")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")

    const handleSubmit = async () => {
    const url =
        mode === "register"
        ? "http://localhost:5050/api/Auth/register"
        : "http://localhost:5050/api/Auth/login";

    const body =
        mode === "register"
        ? {
            fullName: `${firstName} ${lastName}`,
            email,
            password,
            }
        : {
            email,
            password,
            };

    try {
        const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!res.ok) {
        alert(data.message || "Ошибка");
        return;
        }

        alert("Успех!");
        console.log("Ответ сервера:", data);
    } catch (e) {
        alert("Ошибка сети");
        console.error(e);
    }
    };


    return (
        <div className="min-h-screen bg-white flex flex-col items-center px-4">

            {/* Название сайта */}
            <div className="mt-16 text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-black">
                    Реверсивная диаграмма Ганта
                </h1>
            </div>

            {/* Форма */}
            <div className="flex-1 flex items-center justify-center w-full max-w-md mt-12 mb-20">
                <div className="bg-gray-100 p-8 rounded-2xl shadow-md w-full">
                    <h2 className="text-2xl font-semibold text-black mb-6 text-center">
                        {mode === "login" ? "Войти" : "Регистрация"}
                    </h2>

                    {mode === "register" && (
                        <div className="flex gap-4 mb-4">
                            <Input
                                type="text"
                                placeholder="Имя"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                            <Input
                                type="text"
                                placeholder="Фамилия"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                    )}

                    <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mb-4"
                    />

                    <Input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mb-4"
                    />

                    <Button onClick={handleSubmit}>
                        {mode === "login" ? "Войти" : "Зарегистрироваться"}
                    </Button>

                    <p className="text-center text-sm text-black mt-4">
                        {mode === "login" ? (
                            <>
                                Нет аккаунта?{" "}
                                <button
                                    onClick={() => setMode("register")}
                                    className="underline"
                                >
                                    Зарегистрироваться
                                </button>
                            </>
                        ) : (
                            <>
                                Уже есть аккаунт?{" "}
                                <button
                                    onClick={() => setMode("login")}
                                    className="underline"
                                >
                                    Войти
                                </button>
                            </>
                        )}
                    </p>
                </div>
            </div>
        </div>
    )
}
