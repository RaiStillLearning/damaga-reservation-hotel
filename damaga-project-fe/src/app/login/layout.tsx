export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: "url('/AuthBackground/background login.jpg')",
      }}
    >
      {children}
    </div>
  );
}
