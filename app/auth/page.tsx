import { LoginForm } from "@/features/auth/ui/login-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-4">
            <Image src="/ninja-logo.jpg" alt="Logo" width={128} height={128} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>
          <p className="text-sm text-gray-500 mt-2">
            Ingresa tus credenciales para administrar el stock de camisetas
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
