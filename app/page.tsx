'use client';
import { ThemeProvider } from 'next-themes'
import Header from "../components/Header";
import Content from "../components/Content";

export default function Home() {
  return (
    <ThemeProvider attribute="class">
        <div className="flex flex-col h-screen overflow-hidden">
          <Header />
          <Content />
        </div>
    </ThemeProvider>
  );
}
