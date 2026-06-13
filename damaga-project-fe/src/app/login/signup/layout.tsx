import "../../globals.css";

export const metadata = {
  title: "Sign Up",
  description: "Create a new account",
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center  p-6">
      {children}
    </main>
  );
}
