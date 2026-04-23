'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform, useInView, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { translations } from '../lib/i18n'

// Custom Cursor Component
function CustomCursor() {
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const ringX = useSpring(cursorX, { stiffness: 300, damping: 30 })
  const ringY = useSpring(cursorY, { stiffness: 300, damping: 30 })
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
    }

    const handleHover = () => setIsHovering(true)
    const handleLeave = () => setIsHovering(false)

    window.addEventListener('mousemove', moveCursor)
    
    const interactiveElements = document.querySelectorAll('a, button, .interactive')
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleHover)
      el.addEventListener('mouseleave', handleLeave)
    })

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleHover)
        el.removeEventListener('mouseleave', handleLeave)
      })
    }
  }, [cursorX, cursorY])

  return (
    <>
      <motion.div 
        className="cursor-dot hidden lg:block" 
        style={{ x: cursorX, y: cursorY }}
      />
      <motion.div 
        className={`cursor-ring hidden lg:block ${isHovering ? 'hover' : ''}`}
        style={{ x: ringX, y: ringY }}
      />
    </>
  )
}

// Animated text reveal
function AnimatedText({ text, className = '', delay = 0 }: { text: string; className?: string; delay?: number }) {
  return (
    <span className={`inline-block overflow-hidden ${className}`}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ 
            duration: 0.5, 
            delay: delay + i * 0.03,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="inline-block"
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  )
}

// Section with scroll animation
function AnimatedSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Before/After Slider Component
function BeforeAfterSlider({ before, after }: { before: string; after: string }) {
  const [position, setPosition] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    setPosition((x / rect.width) * 100)
  }, [])

  const handleMouseDown = () => { isDragging.current = true }
  const handleMouseUp = () => { isDragging.current = false }
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) handleMove(e.clientX)
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX)
  }

  return (
    <div 
      ref={containerRef}
      className="relative aspect-[4/3] rounded-2xl overflow-hidden glow interactive"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      <Image src={after} alt="Despues" fill className="object-cover" />
      <div 
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image src={before} alt="Antes" fill className="object-cover" />
      </div>
      
      {/* Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-accent z-10"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-accent flex items-center justify-center glow-strong">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-background">
            <path d="M8 5l-5 7 5 7M16 5l5 7-5 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-4 left-4 px-3 py-1 glass-dark rounded-full text-sm font-medium">ANTES</div>
      <div className="absolute bottom-4 right-4 px-3 py-1 glass-dark rounded-full text-sm font-medium">DESPUES</div>
    </div>
  )
}

// Floating Particles
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-accent/30 rounded-full"
          initial={{ 
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: typeof window !== 'undefined' ? window.innerHeight + 100 : 900
          }}
          animate={{ 
            y: -100,
            rotate: 360
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: 'linear'
          }}
          style={{
            width: 4 + Math.random() * 8,
            height: 4 + Math.random() * 8,
          }}
        />
      ))}
    </div>
  )
}

// Counter animation
function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (isInView) {
      const duration = 2000
      const steps = 60
      const increment = value / steps
      let current = 0
      const timer = setInterval(() => {
        current += increment
        if (current >= value) {
          setCount(value)
          clearInterval(timer)
        } else {
          setCount(Math.floor(current))
        }
      }, duration / steps)
      return () => clearInterval(timer)
    }
  }, [isInView, value])

  return <span ref={ref}>{count}{suffix}</span>
}

const services = [
  { 
    name: 'Detailing Exterior Completo',
    desc: 'Lavado premium, descontaminacion y proteccion total del exterior',
    price: 'Desde $80',
    features: ['Lavado a mano', 'Clay bar', 'Sellador ceramico', 'Llantas y rines']
  },
  { 
    name: 'Detailing Interior Premium',
    desc: 'Limpieza profunda de cada rincon del interior',
    price: 'Desde $120',
    features: ['Aspirado profundo', 'Vapor y extraccion', 'Cuero acondicionado', 'Ozono']
  },
  { 
    name: 'Proteccion Ceramica',
    desc: 'Coating ceramico profesional de larga duracion',
    price: 'Desde $450',
    features: ['Preparacion de pintura', 'Coating 9H', '3 anos proteccion', 'Hidrofobico']
  },
  { 
    name: 'Correccion de Pintura',
    desc: 'Eliminacion de rayas, swirls y defectos',
    price: 'Desde $250',
    features: ['Evaluacion UV', 'Pulido multi-etapa', 'Brillo espejo', 'Sellado final']
  },
  { 
    name: 'Restauracion de Faros',
    desc: 'Faros cristalinos como nuevos',
    price: 'Desde $60',
    features: ['Lijado progresivo', 'Pulido optico', 'Sellador UV', 'Garantia 2 anos']
  },
  { 
    name: 'Limpieza de Motor',
    desc: 'Motor impecable y protegido',
    price: 'Desde $80',
    features: ['Desengrasado', 'Vapor seguro', 'Protector plasticos', 'Detallado final']
  },
]

const testimonials = [
  {
    name: 'Carlos Rodriguez',
    text: 'Increible trabajo. Mi auto parece recien salido de la agencia.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80'
  },
  {
    name: 'Maria Garcia',
    text: 'Profesionalismo y atencion al detalle. 100% recomendado.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80'
  },
  {
    name: 'Roberto Martinez',
    text: 'El coating ceramico vale cada centavo. Proteccion real.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80'
  },
  {
    name: 'Ana Lopez',
    text: 'Transformaron mi auto por completo. Excelente servicio.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80'
  },
]

const galleryItems = [
  '/img/WhatsApp Image 2026-04-20 at 8.09.36 PM (1).jpeg',
  '/img/WhatsApp Image 2026-04-20 at 8.09.36 PM.jpeg',
  '/img/WhatsApp Image 2026-04-20 at 8.09.40 PM.jpeg',
  '/img/WhatsApp Image 2026-04-20 at 8.09.41 PM.jpeg',
  '/img/WhatsApp Image 2026-04-20 at 8.09.43 PM.jpeg',
  '/img/WhatsApp Image 2026-04-20 at 8.09.49 PM (1).jpeg',
  '/img/WhatsApp Image 2026-04-20 at 8.09.49 PM (2).jpeg',
  '/img/WhatsApp Image 2026-04-20 at 8.09.49 PM.jpeg',
  '/img/WhatsApp Image 2026-04-20 at 8.23.07 PM (1).jpeg',
  '/img/WhatsApp Image 2026-04-20 at 8.23.07 PM (2).jpeg',
  '/img/WhatsApp Image 2026-04-20 at 8.23.07 PM.jpeg'
]

const pricingPlans = [
  {
    name: 'ESENCIAL',
    price: '$99',
    desc: 'Mantenimiento regular',
    features: ['Lavado exterior premium', 'Aspirado interior', 'Limpieza de vidrios', 'Protector de llantas'],
    notIncluded: ['Coating ceramico', 'Correccion de pintura'],
    popular: false
  },
  {
    name: 'PREMIUM',
    price: '$249',
    desc: 'Transformacion completa',
    features: ['Todo de Esencial', 'Detailing interior completo', 'Clay bar y sellador', 'Acondicionador de cuero', 'Limpieza de motor'],
    notIncluded: ['Coating ceramico'],
    popular: true
  },
  {
    name: 'ELITE',
    price: '$599',
    desc: 'Proteccion maxima',
    features: ['Todo de Premium', 'Coating ceramico 9H', 'Correccion de pintura', 'Proteccion de faros', 'Garantia 3 anos'],
    notIncluded: [],
    popular: false
  },
]

export default function Page() {
  const [lang, setLang] = useState<'es' | 'en'>('es')
  const t = translations[lang]

  const [isLoading, setIsLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const heroRef = useRef(null)
  const videoCarouselRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.2])
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200])

  const scrollVideos = (direction: 'left' | 'right') => {
    if (videoCarouselRef.current) {
      videoCarouselRef.current.scrollBy({ 
        left: direction === 'left' ? -340 : 340, 
        behavior: 'smooth' 
      });
    }
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % t.testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [t.testimonials.length])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const timer = setTimeout(() => {
      setIsLoading(false)
      document.body.style.overflow = 'unset'
    }, 2000)
    return () => {
      clearTimeout(timer)
      document.body.style.overflow = 'unset'
    }
  }, [])

  return (
    <>
      <CustomCursor />

      {/* PRELOADER */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="preloader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              <Image 
                src="/img/logo.png" 
                alt="Cargando Guzman Autodetailing" 
                width={300} 
                height={100} 
                className="w-auto h-20 md:h-28 object-contain mb-8 filter drop-shadow-lg"
                priority
              />
              <motion.div 
                className="w-64 h-[2px] bg-gray-200 mt-6 relative overflow-hidden rounded-full"
              >
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-black rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.8, ease: "easeInOut" }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* NAVBAR */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass-dark' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="#" className="interactive block">
            <Image 
              src="/img/logo.png" 
              alt="Guzman Autodetailing Logo" 
              width={200} 
              height={60} 
              className="h-10 md:h-14 w-auto object-contain" 
              priority
            />
          </a>
          
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: t.nav.services, id: 'servicios' },
              { label: t.nav.gallery, id: 'galeria' },
              { label: t.nav.packages, id: 'paquetes' },
              { label: t.nav.contact, id: 'contacto' }
            ].map((item) => (
              <a 
                key={item.id}
                href={`#${item.id}`} 
                className="text-sm text-muted-foreground hover:text-accent transition-colors relative group interactive"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
            
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 backdrop-blur-md">
              <button 
                onClick={() => setLang('es')}
                className={`text-xs font-semibold px-2 py-1 rounded-full transition-colors ${lang === 'es' ? 'bg-accent text-white' : 'text-muted-foreground hover:text-white'}`}
              >
                ES
              </button>
              <button 
                onClick={() => setLang('en')}
                className={`text-xs font-semibold px-2 py-1 rounded-full transition-colors ${lang === 'en' ? 'bg-accent text-white' : 'text-muted-foreground hover:text-white'}`}
              >
                EN
              </button>
            </div>

            <motion.a 
              href="#contacto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary px-6 py-2.5 rounded-full text-sm interactive whitespace-nowrap"
            >
              {t.nav.book}
            </motion.a>
          </div>

          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 interactive"
          >
            <motion.span 
              animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 6 : 0 }}
              className="w-6 h-0.5 bg-foreground origin-center"
            />
            <motion.span 
              animate={{ opacity: menuOpen ? 0 : 1 }}
              className="w-6 h-0.5 bg-foreground"
            />
            <motion.span 
              animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -6 : 0 }}
              className="w-6 h-0.5 bg-foreground origin-center"
            />
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden glass-dark overflow-hidden"
            >
              <div className="px-6 py-8 flex flex-col gap-6">
                {[
                  { label: t.nav.services, id: 'servicios' },
                  { label: t.nav.gallery, id: 'galeria' },
                  { label: t.nav.packages, id: 'paquetes' },
                  { label: t.nav.contact, id: 'contacto' }
                ].map((item, i) => (
                  <motion.a 
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={() => setMenuOpen(false)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-2xl font-serif interactive block"
                  >
                    {item.label}
                  </motion.a>
                ))}

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-4 mt-4"
                >
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
                    <button 
                      onClick={() => setLang('es')}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${lang === 'es' ? 'bg-accent text-white' : 'text-muted-foreground hover:text-white'}`}
                    >
                      ESPAÑOL
                    </button>
                    <button 
                      onClick={() => setLang('en')}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${lang === 'en' ? 'bg-accent text-white' : 'text-muted-foreground hover:text-white'}`}
                    >
                      ENGLISH
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* HERO */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        <motion.div style={{ scale: heroScale, y: heroY }} className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80"
          >
            <source src="https://cdn.coverr.co/videos/coverr-washing-a-car-2461/1080p.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/60 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/40" />
        </motion.div>
        
        {/* Floating orbs */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-accent-dark/10 rounded-full blur-[100px] animate-float" />
        
        <motion.div 
          style={{ opacity: heroOpacity }}
          className="relative z-10 h-full flex items-center"
        >
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="max-w-4xl">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 1 }}
                className="w-20 h-1 bg-gradient-to-r from-accent to-accent-dark mb-8 origin-left"
              />
              
              <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-none tracking-tight mb-4">
                <AnimatedText text={t.heroMain.line1} delay={0.8} />
              </h1>
              <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-none tracking-tight mb-8">
                <span className="gradient-text text-glow">
                  <AnimatedText text={t.heroMain.line2} delay={1.2} />
                </span>
              </h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.8 }}
                className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed"
              >
                {t.heroMain.desc}
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 2.2 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <motion.a 
                  href="#contacto"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-primary px-8 py-4 rounded-full font-semibold text-center interactive"
                >
                  {t.heroMain.btn1}
                </motion.a>
                <motion.a 
                  href="#galeria"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="glass px-8 py-4 rounded-full font-medium text-center hover:bg-card-hover transition-colors interactive"
                >
                  {t.heroMain.btn2}
                </motion.a>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-muted-foreground tracking-[0.3em]">SCROLL</span>
          <motion.div 
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-px h-16 bg-gradient-to-b from-accent to-transparent"
          />
        </motion.div>
      </section>

      {/* VALUE PROPOSITION */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 shimmer opacity-50" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <AnimatedSection className="text-center mb-16">
            <span className="text-accent text-sm tracking-[0.4em] block mb-4">{t.valueProposition.subtitle}</span>
            <h2 className="font-display text-4xl md:text-6xl tracking-tight">
              {t.valueProposition.titleLine1}<br />
              <span className="gradient-text text-glow">{t.valueProposition.titleLine2}</span>
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
            {t.valueProposition.items.map((item, i) => (
              <AnimatedSection key={i} delay={i * 0.15}>
                <motion.div 
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="glass rounded-2xl p-8 h-full relative overflow-hidden group interactive"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-colors" />
                  <span className="text-6xl font-display gradient-text opacity-30">{item.icon}</span>
                  <h3 className="text-2xl font-semibold mt-4 mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-accent-dark scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="servicios" className="py-24 bg-muted relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-6 relative">
          <AnimatedSection className="mb-16">
            <span className="text-accent text-sm tracking-[0.4em] block mb-4">{t.servicesHead.subtitle}</span>
            <h2 className="font-display text-4xl md:text-6xl tracking-tight">
              {t.servicesHead.titleLine1}<br />
              <span className="gradient-text text-glow">{t.servicesHead.titleLine2}</span>
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.services.map((service, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <motion.div 
                  whileHover={{ y: -8 }}
                  className="glass rounded-2xl p-6 h-full group interactive"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-5xl font-display gradient-text opacity-50">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{service.desc}</p>
                  <ul className="space-y-2">
                    {service.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <svg className="w-4 h-4 text-accent flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 pt-4 border-t border-border">
                    <a href="#contacto" className="text-accent text-sm font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
                      {t.servicesHead.bookNow}
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 8h10M9 4l4 4-4 4" />
                      </svg>
                    </a>
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[150px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative">
          <AnimatedSection className="text-center mb-16">
            <span className="text-accent text-sm tracking-[0.4em] block mb-4">{t.testimonialHead.subtitle}</span>
            <h2 className="font-display text-4xl md:text-6xl tracking-tight">
              {t.testimonialHead.titleLine1}<br />
              <span className="gradient-text text-glow">{t.testimonialHead.titleLine2}</span>
            </h2>
          </AnimatedSection>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mb-20">
            {[
              { value: 500, suffix: t.stats[0].suffix, label: t.stats[0].label },
              { value: 98, suffix: t.stats[1].suffix, label: t.stats[1].label },
              { value: 5, suffix: t.stats[2].suffix, label: t.stats[2].label },
            ].map((stat, i) => (
              <AnimatedSection key={i} delay={i * 0.1} className="text-center">
                <div className="text-4xl md:text-6xl font-display gradient-text text-glow">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-muted-foreground mt-2">{stat.label}</p>
              </AnimatedSection>
            ))}
          </div>

          {/* Testimonials carousel */}
          <div className="relative max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="glass rounded-3xl p-8 md:p-12 text-center"
              >
                <div className="flex justify-center mb-4">
                  {[...Array(t.testimonials[activeTestimonial].rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-xl md:text-2xl font-light italic mb-8 leading-relaxed">
                  &ldquo;{t.testimonials[activeTestimonial].text}&rdquo;
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Image 
                    src={t.testimonials[activeTestimonial].image} 
                    alt={t.testimonials[activeTestimonial].name}
                    width={56}
                    height={56}
                    className="rounded-full object-cover"
                  />
                  <span className="font-semibold">{t.testimonials[activeTestimonial].name}</span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {t.testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-2 h-2 rounded-full transition-all interactive ${
                    i === activeTestimonial ? 'bg-accent w-8' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="galeria" className="py-24 bg-muted relative">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <span className="text-accent text-sm tracking-[0.4em] block mb-4">{t.gallery.subtitle}</span>
            <h2 className="font-display text-4xl md:text-6xl tracking-tight">
              {t.gallery.titleLine1}<br />
              <span className="gradient-text text-glow">{t.gallery.titleLine2}</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              {t.gallery.desc}
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 auto-rows-[180px] md:auto-rows-[280px] grid-flow-row-dense">
            {galleryItems.map((item, i) => {
              // Patrón asimétrico estilo Bento Grid
              let spanClass = "col-span-1 row-span-1";
              if (i === 0) spanClass = "col-span-2 row-span-2 md:col-span-2 md:row-span-2";
              else if (i === 3) spanClass = "col-span-2 row-span-1 md:col-span-2 md:row-span-1";
              else if (i === 4) spanClass = "col-span-1 row-span-2 md:col-span-1 md:row-span-2";
              else if (i === 7) spanClass = "col-span-1 row-span-2 md:col-span-2 md:row-span-2";
              else if (i === 10) spanClass = "col-span-2 md:col-span-2 row-span-1";

              return (
                <AnimatedSection key={i} delay={(i % 3) * 0.15} className={`${spanClass} w-full h-full`}>
                  <motion.div 
                    whileHover={{ scale: 0.98 }}
                    className="relative w-full h-full rounded-xl md:rounded-3xl overflow-hidden glass interactive group shadow-lg drop-shadow-sm"
                  >
                    <Image 
                      src={item} 
                      alt={`Trabajo de detailing premium ${i + 1}`} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </motion.div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* VIDEOS */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <span className="text-accent text-sm tracking-[0.4em] block mb-4">{t.videos.subtitle}</span>
            <h2 className="font-display text-4xl md:text-6xl tracking-tight">
              {t.videos.titleLine1}<br />
              <span className="gradient-text text-glow">{t.videos.titleLine2}</span>
            </h2>
          </AnimatedSection>

          <div 
            ref={videoCarouselRef}
            className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 pt-4 items-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {/* Espaciador inicial para permitir centrado del primer elemento en móvil */}
            <div className="snap-center shrink-0 w-2 md:w-0"></div>
            
            {[
              { id: 'HQ7FoKw0eMg', isVertical: false },
              { id: '0GN4qvCzv20', isVertical: false },
              { id: 'iBifetLEOM0', isVertical: true },
              { id: 'jqvxNh22XhU', isVertical: true },
            ].map((vid, i) => (
              <AnimatedSection key={i} delay={i * 0.15} className="snap-center shrink-0">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className={`relative overflow-hidden rounded-2xl glass shadow-xl ring-1 ring-white/10 interactive ${
                    vid.isVertical ? 'w-[75vw] max-w-[320px] aspect-[9/16]' : 'w-[85vw] max-w-[500px] aspect-video'
                  }`}
                >
                  <iframe 
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${vid.id}`} 
                    title={`YouTube video player ${i + 1}`}
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                  ></iframe>
                </motion.div>
              </AnimatedSection>
            ))}
            
            {/* Espaciador final para permitir centrado del último elemento en móvil */}
            <div className="snap-center shrink-0 w-2 md:w-0"></div>
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <button 
              onClick={() => scrollVideos('left')}
              className="w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-card-hover interactive text-accent shadow-lg"
              aria-label={t.videos.prev}
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button 
              onClick={() => scrollVideos('right')}
              className="w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-card-hover interactive text-accent shadow-lg"
              aria-label={t.videos.next}
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-20">
            <span className="text-accent text-sm tracking-[0.4em] block mb-4">{t.process.subtitle}</span>
            <h2 className="font-display text-4xl md:text-6xl tracking-tight">
              {t.process.titleLine1}<br />
              <span className="gradient-text text-glow">{t.process.titleLine2}</span>
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
            
            {t.process.steps.map((step, i) => (
              <AnimatedSection key={i} delay={i * 0.2} className="text-center relative">
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: 3 }}
                  className="w-24 h-24 mx-auto mb-6 rounded-2xl glass flex items-center justify-center relative glow interactive"
                >
                  <svg className="w-10 h-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={step.icon} />
                  </svg>
                </motion.div>
                <span className="text-7xl font-display gradient-text opacity-20 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4">{step.num}</span>
                <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="paquetes" className="py-24 bg-muted relative">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <span className="text-accent text-sm tracking-[0.4em] block mb-4">{t.packagesHead.subtitle}</span>
            <h2 className="font-display text-4xl md:text-6xl tracking-tight">
              {t.packagesHead.titleLine1}<br />
              <span className="gradient-text text-glow">{t.packagesHead.titleLine2}</span>
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {t.packages.map((plan, i) => (
              <AnimatedSection key={i} delay={i * 0.15}>
                <motion.div 
                  whileHover={{ y: -10 }}
                  className={`rounded-3xl p-8 h-full flex flex-col relative overflow-hidden interactive ${
                    plan.popular ? 'glass glow-strong border-2 border-accent/50' : 'glass'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-4 right-4 bg-accent text-background text-xs font-bold px-3 py-1 rounded-full">
                      POPULAR
                    </div>
                  )}
                  <span className="text-accent text-sm tracking-[0.2em] font-semibold">{plan.name}</span>
                  <p className="text-muted-foreground mb-6 mt-6">{plan.desc}</p>
                  
                  <ul className="space-y-3 mb-8 flex-grow">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm">
                        <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                    {plan.notIncluded.map((f, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm text-muted-foreground/50">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <motion.a 
                    href="#contacto"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-3 rounded-full text-center font-semibold transition-colors ${
                      plan.popular ? 'btn-primary' : 'glass hover:bg-card-hover'
                    }`}
                  >
                    {plan.btn}
                  </motion.a>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contacto" className="py-32 relative overflow-hidden">
        <Particles />
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=80"
            alt="Background"
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background" />
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[150px] animate-pulse-glow" />

        <div className="max-w-4xl mx-auto px-6 relative text-center">
          <AnimatedSection>
            <span className="text-accent text-sm tracking-[0.4em] block mb-4">{t.cta.subtitle}</span>
            <h2 className="font-display text-4xl md:text-6xl lg:text-7xl tracking-tight mb-6">
              {t.cta.titleLine1}<br />
              <span className="gradient-text text-glow">{t.cta.titleLine2}</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-4">
              {t.cta.text1}
            </p>
            <div className="text-5xl md:text-7xl font-display gradient-text text-glow mb-8">
              {t.cta.discount}
            </div>
            <p className="text-muted-foreground mb-10">{t.cta.text2}</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a 
                href="https://wa.me/17409720931"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary px-10 py-5 rounded-full font-bold text-lg glow-strong inline-flex items-center justify-center gap-3 interactive"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {t.cta.btn}
              </motion.a>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-16 border-t border-border relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="mb-4">
                <Image 
                  src="/img/logo.png" 
                  alt="Guzman Autodetailing Logo" 
                  width={200} 
                  height={60} 
                  className="h-12 md:h-16 w-auto object-contain" 
                />
              </div>
              <p className="text-muted-foreground mt-4 max-w-sm leading-relaxed">
                {t.footer.desc}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{t.footer.servicesLabel}</h4>
              <ul className="space-y-2 text-muted-foreground">
                {t.services.slice(0, 4).map((s, i) => (
                  <li key={i}><a href="#servicios" className="hover:text-accent transition-colors interactive">{s.name}</a></li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{t.footer.contactLabel}</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  Tel: <a href="https://wa.me/17409720931" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors interactive">740-972-0931</a>
                </li>
                <li>{t.footer.days}: 8am - 6pm</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>2026 {t.footer.rights}</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-accent transition-colors interactive">{t.footer.privacy}</a>
              <a href="#" className="hover:text-accent transition-colors interactive">{t.footer.terms}</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
