"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, CheckCircle, Zap } from "lucide-react";

// Cloud Provider Icons
function AwsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 0 1-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 0 1-.287-.375 6.18 6.18 0 0 1-.248-.471c-.622.734-1.405 1.101-2.347 1.101-.67 0-1.205-.191-1.596-.574-.391-.384-.59-.894-.59-1.533 0-.678.239-1.23.726-1.644.487-.415 1.133-.623 1.955-.623.272 0 .551.024.846.064.296.04.6.104.918.176v-.583c0-.607-.127-1.03-.375-1.277-.255-.248-.686-.367-1.3-.367-.28 0-.568.031-.863.103-.295.072-.583.16-.862.272a2.287 2.287 0 0 1-.28.104.488.488 0 0 1-.127.023c-.112 0-.168-.08-.168-.247v-.391c0-.128.016-.224.056-.28a.597.597 0 0 1 .224-.167c.279-.144.614-.264 1.005-.36a4.84 4.84 0 0 1 1.246-.151c.95 0 1.644.216 2.091.647.439.43.662 1.085.662 1.963v2.586zm-3.24 1.214c.263 0 .534-.048.822-.144.287-.096.543-.271.758-.51.128-.152.224-.32.272-.512.047-.191.08-.423.08-.694v-.335a6.66 6.66 0 0 0-.735-.136 6.02 6.02 0 0 0-.75-.048c-.535 0-.926.104-1.19.32-.263.215-.39.518-.39.917 0 .375.095.655.295.846.191.2.47.296.838.296zm6.41.862c-.144 0-.24-.024-.304-.08-.064-.048-.12-.16-.168-.311L7.586 5.55a1.398 1.398 0 0 1-.072-.32c0-.128.064-.2.191-.2h.783c.151 0 .255.025.31.08.065.048.113.16.16.312l1.342 5.284 1.245-5.284c.04-.16.088-.264.151-.312a.549.549 0 0 1 .32-.08h.638c.152 0 .256.025.32.08.063.048.12.16.151.312l1.261 5.348 1.381-5.348c.048-.16.104-.264.16-.312a.52.52 0 0 1 .311-.08h.743c.127 0 .2.065.2.2 0 .04-.009.08-.017.128a1.137 1.137 0 0 1-.056.2l-1.923 6.17c-.048.16-.104.264-.168.312a.549.549 0 0 1-.32.08h-.687c-.151 0-.255-.024-.32-.08-.063-.056-.119-.16-.15-.32l-1.238-5.148-1.23 5.14c-.04.16-.087.264-.15.32-.065.056-.177.08-.32.08zm10.256.215c-.415 0-.83-.048-1.229-.143-.399-.096-.71-.2-.918-.32-.128-.071-.215-.151-.247-.223a.563.563 0 0 1-.048-.224v-.407c0-.167.064-.247.183-.247.048 0 .096.008.144.024.048.016.12.048.2.08.271.12.566.215.878.279.319.064.63.096.95.096.502 0 .894-.088 1.165-.264a.86.86 0 0 0 .415-.758.777.777 0 0 0-.215-.559c-.144-.151-.415-.287-.806-.407l-1.157-.36c-.583-.183-1.014-.454-1.277-.813a1.902 1.902 0 0 1-.4-1.158c0-.335.073-.63.216-.886.144-.255.335-.479.575-.654.24-.184.51-.32.83-.415.32-.096.655-.136 1.006-.136.175 0 .359.008.535.032.183.024.35.056.518.088.16.04.312.08.455.127.144.048.256.096.336.144a.69.69 0 0 1 .24.2.43.43 0 0 1 .071.263v.375c0 .168-.064.256-.184.256a.83.83 0 0 1-.303-.096 3.652 3.652 0 0 0-1.532-.311c-.455 0-.815.071-1.062.223-.248.152-.375.383-.375.71 0 .224.08.416.24.567.159.152.454.304.877.44l1.134.358c.574.184.99.44 1.237.767.247.327.367.702.367 1.117 0 .343-.072.655-.207.926-.144.272-.336.511-.583.703-.248.2-.543.343-.886.447-.36.111-.734.167-1.142.167z"/>
    </svg>
  );
}

function GcpIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.19 2.38a9.344 9.344 0 0 0-9.234 6.893c.053-.02-.055.013 0 0-3.875 2.551-3.922 8.11-.247 10.941l.006-.007-.007.03a6.717 6.717 0 0 0 4.077 1.356h5.173l.03.03h5.192c6.687.053 9.376-8.605 3.835-12.35a9.365 9.365 0 0 0-8.825-6.893zM8.073 19.831a4.966 4.966 0 0 1-2.9-1.088l.006-.003a5.002 5.002 0 0 1 .004-7.47l.003.003.003-.003.006.007a5.006 5.006 0 0 1 7.471.003l-1.768 1.768a2.501 2.501 0 1 0 0 3.536l1.77 1.77a5.013 5.013 0 0 1-4.595 1.477zm11.034-5.012l-2.004-.001v2.004h-1.5v-2.004l-2.004-.001v-1.501h2.004V11.31h1.5v2.006l2.004-.001z"/>
    </svg>
  );
}

function AzureIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M5.483 21.3H24L14.025 4.013l-3.038 8.347 5.836 6.938L5.483 21.3zM13.23 2.7L6.105 8.677 0 19.253h5.505l7.725-16.553z"/>
    </svg>
  );
}

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20">
      <div className="w-full px-6 lg:px-12 py-20">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm animate-fade-in">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-white/60">Multi-Cloud Security</span>
            <span className="text-white/30">•</span>
            <span className="text-white/60">500+ Security Checks</span>
          </div>

          {/* Cloud Provider Icons */}
          <div className="flex items-center justify-center gap-6 animate-fade-in">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <AwsIcon className="w-6 h-6 text-orange-400" />
              <span className="text-orange-400 font-medium">AWS</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <GcpIcon className="w-6 h-6 text-blue-400" />
              <span className="text-blue-400 font-medium">GCP</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <AzureIcon className="w-6 h-6 text-cyan-400" />
              <span className="text-cyan-400 font-medium">Azure</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight animate-slide-up">
            <span className="text-white">Secure Your Cloud.</span>
            <br />
            <span className="text-gradient-purple">Sleep Better.</span>
          </h1>

          {/* Subheadline */}
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/50 leading-relaxed animate-slide-up stagger-1">
            Enterprise-grade multi-cloud security auditing for AWS, GCP, and Azure.
            One unified dashboard. Complete visibility across all your cloud environments.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-slide-up stagger-2">
            <Link href="/register">
              <Button size="lg" className="btn-gradient px-8 py-6 text-lg group">
                Start Free Audit
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-white/20 hover:bg-white/5">
                Learn More
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 pt-12 animate-fade-in stagger-3">
            {[
              { icon: Shield, label: "SOC 2 Compliant Checks" },
              { icon: CheckCircle, label: "CIS Benchmark Coverage" },
              { icon: Zap, label: "Real-time Scanning" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-white/40">
                <item.icon className="w-5 h-5 text-primary/60" />
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 animate-slide-up stagger-4">
          {[
            { value: "3", label: "Cloud Platforms", sublabel: "AWS, GCP, Azure" },
            { value: "500+", label: "Security Checks", sublabel: "Automated scanning" },
            { value: "25+", label: "Audit Phases", sublabel: "Per platform" },
          ].map((stat, index) => (
            <div
              key={index}
              className="glass-card p-8 text-center group cursor-default"
            >
              <div className="text-4xl md:text-5xl font-bold text-gradient-purple mb-2">
                {stat.value}
              </div>
              <div className="text-white/80 font-medium">{stat.label}</div>
              <div className="text-sm text-white/40 mt-1">{stat.sublabel}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
