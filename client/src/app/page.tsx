"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { PenSquare, Users, Compass, ArrowRight, Zap, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/feed");
    }
  }, [isAuthenticated, router]);

  // Landing for unauthenticated users
  return (
    <div className="min-h-screen bg-background selection:bg-primary/30 flex flex-col overflow-hidden relative">

      {/* Background Effects */}
      <div className="absolute top-0 inset-x-0 h-[500px] pointer-events-none overflow-hidden [mask-image:linear-gradient(to_bottom,white,transparent)] z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[80%] rounded-full bg-primary/20 blur-[120px] mix-blend-screen animate-pulse duration-10000" />
        <div className="absolute top-[10%] right-[-5%] w-[40%] h-[60%] rounded-full bg-blue-500/20 blur-[100px] mix-blend-screen animate-pulse duration-7000 delay-1000" />
      </div>

      {/* Floating Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-md">
        <div className="container mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-blue-600 text-white font-bold text-sm shadow-md">
              C
            </div>
            <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Community
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" className="font-medium hover:bg-primary/10 hover:text-primary transition-colors">
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center z-10">

        {/* Interactive Hero Section */}
        <section className="w-full max-w-6xl mx-auto px-4 pt-32 pb-24 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20 animate-fade-in-up">
            <Zap className="h-4 w-4" />
            <span>The modern social platform</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl text-balance">
            Connect. Share.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500 animate-gradient-x">
              Grow.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl text-balance leading-relaxed">
            Join a vibrant community of creators and thinkers. Share your ideas, build your network, and discover content you'll love.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-bold rounded-full shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)] hover:shadow-[0_0_60px_-15px_rgba(59,130,246,0.7)] hover:scale-105 active:scale-95 transition-all duration-300">
                Get Started for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/explore" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-medium rounded-full border-2 hover:bg-muted/50 hover:scale-105 active:scale-95 transition-all duration-300">
                Explore Content
              </Button>
            </Link>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="w-full max-w-6xl mx-auto px-4 py-24">
          <div className="text-center mb-16 relative">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Everything you need</h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">Powerful features wrapped in a beautiful, intuitive interface.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: PenSquare,
                title: "Share Your Ideas",
                desc: "Create impactful text posts, share high-quality images, or start engaging polls with ease.",
                iconBg: "bg-blue-50 dark:bg-blue-500/10",
                iconColor: "text-blue-600 dark:text-blue-400",
                rayColor: "rgba(59,130,246,0.15)",
              },
              {
                icon: Users,
                title: "Build Your Network",
                desc: "Follow inspiring creators, join niche communities, and grow your own dedicated audience.",
                iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
                iconColor: "text-emerald-600 dark:text-emerald-400",
                rayColor: "rgba(16,185,129,0.15)",
              },
              {
                icon: Compass,
                title: "Discover Content",
                desc: "Explore a rich, personalized feed tailored precisely to your interests and communities.",
                iconBg: "bg-purple-50 dark:bg-purple-500/10",
                iconColor: "text-purple-600 dark:text-purple-400",
                rayColor: "rgba(168,85,247,0.15)",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group relative rounded-3xl border border-border/40 bg-white/70 dark:bg-card/50 backdrop-blur-xl p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden z-10"
              >
                {/* Rotating Light Rays Effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250%] h-[250%] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -z-10 animate-[spin_10s_linear_infinite]"
                  style={{
                    background: `conic-gradient(from 0deg, transparent 0deg, ${item.rayColor} 30deg, transparent 60deg, transparent 180deg, ${item.rayColor} 210deg, transparent 240deg)`
                  }}
                />

                {/* Bright Inner Glow to ensure text readability */}
                <div className="absolute inset-0 bg-white/50 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${item.iconBg} ${item.iconColor} mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3`}>
                  <item.icon className="h-7 w-7" />
                </div>

                <h3 className="text-2xl font-bold mb-3 tracking-tight group-hover:text-foreground transition-colors">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-[15px]">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Simple Footer */}
      <footer className="border-t border-border/40 py-8 text-center bg-muted/20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © 2026 Community Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Secure & private by design</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
