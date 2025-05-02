import "./globals.css";
import NavBar from "@/components/layout/NavBar";

export const metadata = {
  title: "鏵莯空間美學設計報價系統",
  description: "Tailwind-ready clean starter for Huamu Design System.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  );
}
