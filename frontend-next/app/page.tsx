"use client";

import { useState } from "react";
import { Brain, Upload, Search, MessageSquare, ArrowRight, FileText, Image as ImageIcon, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const navItems = ["home", "features", "chat", "documents", "search"];

export default function Home() {
  const [activeSection, setActiveSection] = useState("home");

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-3 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <span className="text-base font-semibold tracking-tight">Personal Brain MCP</span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`px-3 py-2 text-xs uppercase tracking-wide border rounded-md transition-colors ${
                    activeSection === section
                      ? "text-primary border-primary/40 bg-primary/5"
                      : "text-muted-foreground border-transparent hover:border-border hover:text-foreground"
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <section id="home" className="pt-28 pb-12 px-4 md:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Knowledge infrastructure</p>
              <h1 className="mt-3 text-4xl md:text-5xl font-semibold leading-tight tracking-tight">
                Build a low-latency, searchable personal memory system.
              </h1>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-2xl">
                Ingest notes, files, and chats. Query with semantic retrieval. Use AI responses grounded in your own data.
                Designed for reliable recall, not generic chatbot behavior.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={() => scrollToSection("chat")} className="h-9 rounded-md text-sm">
                  Open chat
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => scrollToSection("documents")} className="h-9 rounded-md text-sm">
                  Upload sources
                </Button>
              </div>
            </div>

            <Card className="rounded-md border shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">System snapshot</CardTitle>
                <CardDescription className="text-sm">Current architecture capabilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  "RAG-backed retrieval with citation context",
                  "Unified ingestion for docs, images, audio",
                  "Search + chat + history in one workflow",
                  "Compact UI optimized for dense information",
                ].map((item) => (
                  <div key={item} className="rounded-md border px-3 py-2 text-sm text-muted-foreground">
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="features" className="py-12 px-4 md:px-6 border-t">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight">Core capabilities</h2>
            <p className="mt-2 text-sm text-muted-foreground">Production-oriented features for retrieval and memory workflows.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: MessageSquare, title: "AI Chat", description: "Grounded answers with document context." },
              { icon: FileText, title: "Document Pipeline", description: "Structured ingestion and indexing." },
              { icon: Search, title: "Semantic Search", description: "Natural-language retrieval across sources." },
              { icon: Upload, title: "Fast Upload", description: "Low-friction import across file types." },
            ].map((feature) => (
              <Card key={feature.title} className="rounded-md border shadow-none">
                <CardHeader>
                  <feature.icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                  <CardDescription className="text-sm">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="chat" className="py-12 px-4 md:px-6 border-t">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-semibold tracking-tight">Chat interface</h2>
          <p className="mt-2 text-sm text-muted-foreground">Query your indexed memory with model selection.</p>
          <Card className="mt-6 rounded-md border shadow-none">
            <CardHeader>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <CardTitle className="text-base">Assistant</CardTitle>
                <Tabs defaultValue="gemini" className="w-[220px]">
                  <TabsList className="grid w-full grid-cols-2 rounded-md">
                    <TabsTrigger value="gemini" className="text-xs">Gemini</TabsTrigger>
                    <TabsTrigger value="claude" className="text-xs">Claude</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="min-h-[280px] max-h-[460px] overflow-y-auto p-3 border rounded-md bg-background">
                  <div className="text-center text-muted-foreground py-16">
                    <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-70" />
                    <p className="text-sm">No active messages.</p>
                  </div>
                </div>
                <div className="flex gap-2 items-end">
                  <Textarea placeholder="Ask about your notes, docs, or prior chats..." className="min-h-[56px] rounded-md text-sm" />
                  <Button size="icon" className="h-9 w-9 rounded-md">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="documents" className="py-12 px-4 md:px-6 border-t">
        <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-4">
          <Card className="rounded-md border shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Upload sources</CardTitle>
              <CardDescription className="text-sm">Add files to your memory index.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border border-dashed rounded-md p-8 text-center hover:border-primary/60 transition-colors cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Drop files or click to upload</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, image, audio, text</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-md border shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Recent files</CardTitle>
              <CardDescription className="text-sm">Latest indexed documents.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { icon: FileText, name: "Research-Pipeline-Notes.pdf", size: "2.4 MB" },
                { icon: ImageIcon, name: "Architecture-Diagram.png", size: "1.1 MB" },
                { icon: Music, name: "Weekly-Standup.mp3", size: "15 MB" },
              ].map((doc) => (
                <div key={doc.name} className="flex items-center gap-3 p-2 rounded-md border">
                  <doc.icon className="h-4 w-4 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.size}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="search" className="py-12 px-4 md:px-6 border-t">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-semibold tracking-tight">Search</h2>
          <p className="mt-2 text-sm text-muted-foreground">Run semantic retrieval across your indexed memory.</p>
          <Card className="mt-6 rounded-md border shadow-none">
            <CardContent className="pt-6 space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search knowledge base..." className="pl-9 h-9 rounded-md text-sm" />
                </div>
                <Button className="h-9 rounded-md text-sm">Search</Button>
              </div>
              <div className="min-h-[220px] border rounded-md p-6 bg-background">
                <div className="text-center text-muted-foreground py-10">
                  <Search className="h-8 w-8 mx-auto mb-3 opacity-70" />
                  <p className="text-sm">No query yet.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="py-8 px-4 md:px-6 border-t">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Personal Brain MCP</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Personal Brain — Precision & Density redesign.</p>
          <Button variant="ghost" onClick={() => scrollToSection("home")} className="h-8 rounded-md text-xs">
            Back to top
          </Button>
        </div>
      </footer>
    </div>
  );
}
