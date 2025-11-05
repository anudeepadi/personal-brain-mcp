"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Upload,
  Search,
  MessageSquare,
  ArrowRight,
  FileText,
  Image as ImageIcon,
  Music,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const [activeSection, setActiveSection] = useState("home");

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Personal Brain</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              {["home", "features", "chat", "documents", "search"].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    activeSection === section ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 px-6 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Your AI-powered{" "}
                <span className="gradient-text">second brain</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Store, search, and chat with your knowledge. Upload documents, archive conversations,
                and unlock insights with semantic search powered by AI.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={() => scrollToSection("chat")} className="group">
                  Start Chatting
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => scrollToSection("documents")}>
                  Upload Documents
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: FileText, label: "Documents", delay: 0 },
                  { icon: MessageSquare, label: "Chat", delay: 0.1 },
                  { icon: Search, label: "Search", delay: 0.2 },
                  { icon: Sparkles, label: "AI Insights", delay: 0.3 },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: item.delay + 0.4 }}
                  >
                    <Card className="glass hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <item.icon className="h-12 w-12 text-primary mb-3" />
                        <span className="font-semibold">{item.label}</span>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to manage your knowledge
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: MessageSquare,
                title: "AI Chat",
                description: "Chat with your documents using advanced AI models with citations.",
              },
              {
                icon: FileText,
                title: "Document Management",
                description: "Upload PDFs, images, audio, and text with automatic processing.",
              },
              {
                icon: Search,
                title: "Semantic Search",
                description: "Find information using natural language powered by vectors.",
              },
              {
                icon: Upload,
                title: "Easy Upload",
                description: "Drag-and-drop interface for quick file uploads.",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <feature.icon className="h-12 w-12 text-primary mb-4" />
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Chat Section */}
      <section id="chat" className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Chat with Your Knowledge</h2>
            <p className="text-xl text-muted-foreground">
              Ask questions and get AI-powered answers with citations
            </p>
          </div>

          <Card className="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>AI Assistant</CardTitle>
                <Tabs defaultValue="gemini" className="w-[200px]">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="gemini">Gemini</TabsTrigger>
                    <TabsTrigger value="claude">Claude</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="min-h-[400px] max-h-[600px] overflow-y-auto p-4 border rounded-md bg-background/50">
                  <div className="text-center text-muted-foreground py-20">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Start a conversation</p>
                    <p className="text-sm">Ask me anything about your documents</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Ask a question about your documents..."
                    className="min-h-[60px]"
                  />
                  <Button size="icon" className="h-full aspect-square">
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Documents Section */}
      <section id="documents" className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Document Management</h2>
            <p className="text-xl text-muted-foreground">
              Upload and organize your knowledge base
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Upload Documents</CardTitle>
                <CardDescription>Drag and drop your files here</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-primary/50 rounded-lg p-12 text-center hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
                  <Upload className="h-16 w-16 mx-auto mb-4 text-primary" />
                  <p className="text-lg font-medium mb-2">Drop files here or click to upload</p>
                  <p className="text-sm text-muted-foreground">
                    Supports PDF, images, audio, and text files
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Your Documents</CardTitle>
                <CardDescription>Recently uploaded files</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { icon: FileText, name: "Research Paper.pdf", size: "2.4 MB" },
                    { icon: ImageIcon, name: "Diagram.png", size: "1.1 MB" },
                    { icon: Music, name: "Meeting Recording.mp3", size: "15 MB" },
                  ].map((doc) => (
                    <div
                      key={doc.name}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
                    >
                      <doc.icon className="h-8 w-8 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">{doc.size}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section id="search" className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Semantic Search</h2>
            <p className="text-xl text-muted-foreground">
              Find information across all your knowledge
            </p>
          </div>

          <Card className="glass">
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Search your knowledge base..."
                      className="pl-10 h-12 text-lg"
                    />
                  </div>
                  <Button size="lg">Search</Button>
                </div>

                <div className="flex gap-2">
                  <Tabs defaultValue="documents" className="flex-1">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="documents">Documents</TabsTrigger>
                      <TabsTrigger value="chats">Chat History</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <Input type="number" placeholder="Limit" defaultValue={5} className="w-24" />
                </div>

                <div className="min-h-[300px] border rounded-md p-8 bg-background/50">
                  <div className="text-center text-muted-foreground">
                    <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Start Searching</p>
                    <p className="text-sm">Enter a query to find relevant information</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <span className="font-semibold">Personal Brain</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Personal Brain. Powered by AI.
            </p>
            <Button variant="ghost" onClick={() => scrollToSection("home")}>
              Back to Top
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
