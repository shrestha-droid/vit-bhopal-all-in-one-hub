// Branch HQ design kit: finished effects, built once and tested, so every
// page can use them without rewriting them. Colours come from src/theme.css.
import { Fragment, createContext, useContext, useEffect, useRef, useState, type ReactNode, type ElementType, type MouseEvent as ReactMouseEvent } from 'react'
import { motion, animate, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1] as const
// A kit piece needs a positioned box, but must never override the page's own
// choice: Tailwind emits .relative after .absolute, so adding it would win and
// pull an absolutely placed image back into the flow.
const positioned = (className: string) => (/\b(absolute|fixed|sticky)\b/.test(className) ? '' : 'relative ')
const accent = (alpha = 1) => `rgb(var(--accent, 99 102 241) / ${alpha})`

type TextTag = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div'

/** A headline that enters word by word, out of a soft blur. */
export function BlurText({ text, as = 'h1', className = '', delay = 0 }: { text: string; as?: TextTag; className?: string; delay?: number }) {
  const reduce = useReducedMotion()
  const Plain = as as ElementType
  if (reduce) return <Plain className={className}>{text}</Plain>
  const Tag = motion[as] as typeof motion.h1
  const words = text.split(/\s+/).filter(Boolean)
  return (
    <Tag className={className} aria-label={text} initial="hidden" animate="show" transition={{ staggerChildren: 0.06, delayChildren: delay }}>
      {words.map((word, i) => (
        <Fragment key={i}>
          <motion.span
            aria-hidden
            className="inline-block"
            variants={{ hidden: { opacity: 0, y: 12, filter: 'blur(8px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: EASE } } }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </Tag>
  )
}

/** A slow band of light sweeping across a short phrase. */
export function ShinyText({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.span
      className={`inline-block ${className}`}
      style={{
        backgroundImage: 'linear-gradient(110deg, rgb(var(--ink, 17 17 17)) 38%, rgb(var(--accent, 99 102 241)) 50%, rgb(var(--ink, 17 17 17)) 62%)',
        backgroundSize: '250% 100%',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent'
      }}
      initial={{ backgroundPosition: '100% 0' }}
      animate={reduce ? undefined : { backgroundPosition: ['100% 0', '-150% 0'] }}
      transition={{ duration: 3.2, repeat: Infinity, repeatDelay: 1.2, ease: 'linear' }}
    >
      {children}
    </motion.span>
  )
}

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/'

/** Characters cycle through random glyphs and settle, left to right. */
export function DecryptText({ text, className = '', speed = 28 }: { text: string; className?: string; speed?: number }) {
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(reduce ? text : '')
  useEffect(() => {
    if (reduce) { setShown(text); return }
    let revealed = 0
    const timer = setInterval(() => {
      revealed += 0.5
      const settled = Math.floor(revealed)
      setShown(text.split('').map((ch, i) => (i < settled || ch === ' ' ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join(''))
      if (settled >= text.length) clearInterval(timer)
    }, speed)
    return () => clearInterval(timer)
  }, [text, reduce, speed])
  return <span className={className} aria-label={text}><span aria-hidden>{shown || '\u00a0'}</span></span>
}

/** A number that counts up once, when it first comes into view. */
export function CountUp({ to, from = 0, duration = 1.6, className = '', format }: { to: number; from?: number; duration?: number; className?: string; format?: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const reduce = useReducedMotion()
  const [value, setValue] = useState(reduce ? to : from)
  useEffect(() => {
    if (!inView || reduce) { if (reduce) setValue(to); return }
    const controls = animate(from, to, { duration, ease: EASE, onUpdate: setValue })
    return () => controls.stop()
  }, [inView, reduce, from, to, duration])
  const text = format ? format(value) : new Intl.NumberFormat().format(Math.round(value))
  return <span ref={ref} className={className}>{text}</span>
}

/** A card with a soft glow that follows the cursor. */
export function SpotlightCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const move = (e: ReactMouseEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--spot-x', `${e.clientX - r.left}px`)
    el.style.setProperty('--spot-y', `${e.clientY - r.top}px`)
  }
  return (
    <div ref={ref} onMouseMove={move} className={`group ${positioned(className)}overflow-hidden ${className}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(420px circle at var(--spot-x, 50%) var(--spot-y, 50%), ${accent(0.18)}, transparent 60%)` }}
      />
      <div className="relative">{children}</div>
    </div>
  )
}

/** A card that tilts a few degrees toward the cursor, in 3D. */
export function TiltCard({ children, className = '', max = 8 }: { children: ReactNode; className?: string; max?: number }) {
  const reduce = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [max, -max]), { stiffness: 200, damping: 20 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-max, max]), { stiffness: 200, damping: 20 })
  const move = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (reduce) return
    const r = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - r.left) / r.width - 0.5)
    y.set((e.clientY - r.top) / r.height - 0.5)
  }
  const leave = () => { x.set(0); y.set(0) }
  return (
    <div style={{ perspective: 800 }}>
      <motion.div onMouseMove={move} onMouseLeave={leave} style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} className={className}>
        {children}
      </motion.div>
    </div>
  )
}

/** One important button that eases toward the cursor. A link when given href. */
export function MagnetButton({ children, className = '', href, onClick, type = 'button', strength = 0.3, disabled }: { children: ReactNode; className?: string; href?: string; onClick?: () => void; type?: 'button' | 'submit'; strength?: number; disabled?: boolean }) {
  const reduce = useReducedMotion()
  const x = useSpring(0, { stiffness: 250, damping: 18 })
  const y = useSpring(0, { stiffness: 250, damping: 18 })
  const move = (e: ReactMouseEvent<HTMLElement>) => {
    if (reduce || disabled) return
    const r = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const leave = () => { x.set(0); y.set(0) }
  const cls = `inline-flex items-center justify-center gap-2 ${className}`
  return href
    ? <motion.a href={href} onMouseMove={move} onMouseLeave={leave} style={{ x, y }} className={cls}>{children}</motion.a>
    : <motion.button type={type} onClick={onClick} disabled={disabled} onMouseMove={move} onMouseLeave={leave} style={{ x, y }} className={cls}>{children}</motion.button>
}

/** An endless strip of words or small items. */
export function Marquee({ items, className = '', speed = 30, separator = '✦' }: { items: ReactNode[]; className?: string; speed?: number; separator?: ReactNode }) {
  const reduce = useReducedMotion()
  const row = (hidden: boolean) => (
    <div className="flex shrink-0 items-center gap-8 pr-8" aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <Fragment key={i}>
          <span className="whitespace-nowrap">{item}</span>
          <span aria-hidden className="opacity-40">{separator}</span>
        </Fragment>
      ))}
    </div>
  )
  const mask = 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)'
  return (
    <div className={`${positioned(className)}overflow-hidden ${className}`} style={{ maskImage: mask, WebkitMaskImage: mask }}>
      <motion.div className="flex w-max" animate={reduce ? undefined : { x: ['0%', '-50%'] }} transition={{ duration: speed, ease: 'linear', repeat: Infinity }}>
        {row(false)}
        {row(true)}
      </motion.div>
    </div>
  )
}

/** An image that drifts slightly slower than the page as it scrolls. Fills its box. */
export function Parallax({ src, alt, className = '', strength = 60 }: { src: string; alt: string; className?: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-strength, strength])
  return (
    <div ref={ref} className={`${positioned(className)}overflow-hidden ${className}`}>
      <motion.img src={src} alt={alt} style={{ y, top: -strength, bottom: -strength, height: `calc(100% + ${strength * 2}px)` }} className="absolute inset-x-0 w-full object-cover" />
    </div>
  )
}

/** Slow, blurred colour drifting behind a hero. Place inside a relative, overflow-hidden section. */
export function Aurora({ className = '' }: { className?: string }) {
  const reduce = useReducedMotion()
  const blob = (background: string, position: Record<string, string>, x: number[], y: number[], duration: number) => (
    <motion.div
      aria-hidden
      className="absolute rounded-full"
      style={{ width: '55vmax', height: '55vmax', filter: 'blur(90px)', opacity: 0.35, background, ...position }}
      animate={reduce ? undefined : { x, y }}
      transition={{ duration, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
    />
  )
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {blob(accent(1), { top: '-25%', left: '-15%' }, [0, 90], [0, 50], 24)}
      {blob(accent(0.6), { bottom: '-30%', right: '-20%' }, [0, -70], [0, -40], 28)}
      {blob('rgb(var(--ink, 17 17 17) / 0.25)', { top: '20%', right: '10%' }, [0, -40], [0, 60], 32)}
      <Grain fixed={false} />
    </div>
  )
}

const NOISE = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

/** A film-grain texture, so flat colour reads as material. Render once at the root. */
export function Grain({ opacity = 0.06, fixed = true }: { opacity?: number; fixed?: boolean }) {
  return <div aria-hidden className={`pointer-events-none inset-0 z-50 ${fixed ? 'fixed' : 'absolute'}`} style={{ backgroundImage: NOISE, opacity, mixBlendMode: 'overlay' }} />
}

/** Fades and rises into view the first time it is seen. */
export function Reveal({ children, className = '', delay = 0, y = 24 }: { children: ReactNode; className?: string; delay?: number; y?: number }) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-10% 0px' }} transition={{ duration: 0.7, delay, ease: EASE }}>
      {children}
    </motion.div>
  )
}

// ---- For brands that sell on looks: fashion, shops, beauty -------------------

/** A headline whose lines slide up from behind a mask -- the editorial reveal. */
export function MaskHeadline({ lines, as = 'h1', className = '', delay = 0 }: { lines: string[]; as?: TextTag; className?: string; delay?: number }) {
  const reduce = useReducedMotion()
  const Tag = as as ElementType
  return (
    <Tag className={className} aria-label={lines.join(' ')}>
      {lines.map((line, i) => (
        <span key={i} aria-hidden className="block overflow-hidden pb-[0.06em]">
          <motion.span className="block" initial={reduce ? false : { y: '110%' }} animate={{ y: '0%' }} transition={{ duration: 1.05, delay: delay + i * 0.12, ease: EASE }}>{line}</motion.span>
        </span>
      ))}
    </Tag>
  )
}

function ScrollWord({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1])
  return <><motion.span aria-hidden style={{ opacity }}>{children}</motion.span>{' '}</>
}

/** A paragraph whose words light up one by one as it is read (scroll-linked). */
export function ScrollWords({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.4'] })
  const words = text.split(/\s+/).filter(Boolean)
  if (reduce) return <p className={className}>{text}</p>
  return (
    <p ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => <ScrollWord key={i} progress={scrollYProgress} range={[i / words.length, Math.min(1, (i + 1.5) / words.length)]}>{w}</ScrollWord>)}
    </p>
  )
}

/** A lookbook that moves sideways as the page scrolls down. Falls back to a swipeable row. */
export function HorizontalGallery({ items, className = '' }: { items: Array<{ src: string; alt: string; caption?: string }>; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [distance, setDistance] = useState(0)
  useEffect(() => {
    const el = track.current
    if (!el) return
    const measure = () => setDistance(Math.max(0, el.scrollWidth - window.innerWidth))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
  }, [items.length])
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance])
  const figure = (it: { src: string; alt: string; caption?: string }, i: number) => (
    <figure key={i} className="shrink-0 w-[78vw] md:w-[36vw]">
      <div className="h-[58vh] overflow-hidden"><img src={it.src} alt={it.alt} loading="lazy" className="h-full w-full object-cover" /></div>
      {it.caption && <figcaption className="mt-3 text-xs uppercase tracking-[0.22em] opacity-70">{it.caption}</figcaption>}
    </figure>
  )
  if (reduce) return <div className={`flex gap-6 overflow-x-auto px-6 md:px-12 ${className}`}>{items.map(figure)}</div>
  return (
    <section ref={ref} className={`relative ${className}`} style={{ height: `calc(100vh + ${distance}px)` }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div ref={track} style={{ x }} className="flex gap-6 px-6 md:gap-10 md:px-12">{items.map(figure)}</motion.div>
      </div>
    </section>
  )
}

/** A product: its photo zooms slowly on hover, and swaps to a second photo when there is one. */
export function ProductCard({ image, hoverImage, name, price, tag, href, onClick, action = 'View', className = '' }: { image: string; hoverImage?: string; name: string; price?: string; tag?: string; href?: string; onClick?: () => void; action?: string; className?: string }) {
  const body = (
    <>
      <div className="relative aspect-[3/4] overflow-hidden bg-surface">
        <img src={image} alt={name} loading="lazy" className={`absolute inset-0 h-full w-full object-cover transition duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04] ${hoverImage ? 'group-hover:opacity-0' : ''}`} />
        {hoverImage && <img src={hoverImage} alt="" aria-hidden loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04] group-hover:opacity-100" />}
        {tag && <span className="absolute left-3 top-3 bg-canvas/90 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-ink">{tag}</span>}
        <span className="absolute inset-x-3 bottom-3 translate-y-2 bg-ink py-3 text-center text-[11px] uppercase tracking-[0.22em] text-canvas opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">{action}</span>
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-4 text-sm">
        <span>{name}</span>
        {price && <span className="tabular-nums opacity-70">{price}</span>}
      </div>
    </>
  )
  return href
    ? <a href={href} className={`group block ${className}`}>{body}</a>
    : <button type="button" onClick={onClick} className={`group block w-full text-left ${className}`}>{body}</button>
}

/** An image that wipes up into view the first time it is seen. */
// Watched through its wrapper, and loaded eagerly: a fully clipped image counts
// as invisible, so neither lazy loading nor an in-view trigger ever fired on it --
// measured, the hero photo stayed blank.
export function ImageReveal({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  return (
    <div ref={ref} className={`${positioned(className)}overflow-hidden ${className}`}>
      <motion.img
        src={src} alt={alt} className="h-full w-full object-cover"
        initial={reduce ? false : { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.15 }}
        animate={reduce || inView ? { clipPath: 'inset(0% 0% 0% 0%)', scale: 1 } : undefined}
        transition={{ duration: 1.25, ease: EASE }}
      />
    </div>
  )
}

/** A soft ring that trails the pointer and grows over links and buttons. Desktop only; the normal cursor stays. */
export function Cursor() {
  const reduce = useReducedMotion()
  const [on, setOn] = useState(false)
  const [hover, setHover] = useState(false)
  const x = useSpring(-100, { stiffness: 600, damping: 45 })
  const y = useSpring(-100, { stiffness: 600, damping: 45 })
  useEffect(() => {
    if (reduce || !window.matchMedia('(pointer: fine)').matches) return
    setOn(true)
    const move = (e: MouseEvent) => {
      x.set(e.clientX); y.set(e.clientY)
      setHover(!!(e.target as Element | null)?.closest?.('a, button, [role="button"], input, select, textarea'))
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [reduce, x, y])
  if (!on) return null
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] rounded-full border border-white mix-blend-difference"
      style={{ x, y, translateX: '-50%', translateY: '-50%' }}
      animate={{ width: hover ? 54 : 16, height: hover ? 54 : 16 }}
      transition={{ duration: 0.25, ease: EASE }}
    />
  )
}

/** The brand's name, huge, edge to edge -- measured and fitted to the width, whatever the font. */
export function BigWordmark({ text, className = '' }: { text: string; className?: string }) {
  const box = useRef<HTMLDivElement>(null)
  const word = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState(Math.min(24, 170 / Math.max(3, text.length)))
  useEffect(() => {
    const fit = () => {
      const b = box.current, w = word.current
      if (!b || !w || !w.scrollWidth) return
      setSize(s => Math.min(40, s * (b.clientWidth / w.scrollWidth)))
    }
    fit()
    const ro = new ResizeObserver(fit)
    if (box.current) ro.observe(box.current)
    document.fonts?.ready.then(fit)
    return () => ro.disconnect()
  }, [text])
  return (
    <div ref={box} className={`overflow-hidden ${className}`} aria-hidden>
      <motion.div
        ref={word}
        initial={{ y: '45%', opacity: 0 }} whileInView={{ y: '0%', opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 1.1, ease: EASE }}
        className="inline-block whitespace-nowrap font-display leading-[0.8] tracking-tight"
        style={{ fontSize: `${size}vw` }}
      >
        {text}
      </motion.div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Pages: each part of the site at its own address -- '/', '/collection', '/about' -- with a menu that moves
// between them without reloading. No router package: the browser's own history, and nothing to install.
// /staff is Branch HQ's owner's area (main.tsx) -- never a page here.
// ---------------------------------------------------------------------------
let routeListeners: Array<() => void> = []
/** Go to another page from code: navigate('/contact'). */
export function navigate(to: string) {
  if (to === window.location.pathname + window.location.search) return
  window.history.pushState(null, '', to)
  routeListeners.forEach(listener => listener())
  window.scrollTo({ top: 0 })
}
/** The address of the page being shown, e.g. for highlighting the menu. */
export function usePage(): string {
  const [path, setPath] = useState(window.location.pathname)
  useEffect(() => {
    const on = () => setPath(window.location.pathname)
    routeListeners.push(on)
    window.addEventListener('popstate', on)
    return () => { routeListeners = routeListeners.filter(l => l !== on); window.removeEventListener('popstate', on) }
  }, [])
  return path
}
function matchPath(pattern: string, path: string): Record<string, string> | null {
  const want = pattern.replace(/\/+$/, '').split('/'), got = path.replace(/\/+$/, '').split('/')
  if (want.length !== got.length) return null
  const params: Record<string, string> = {}
  for (let i = 0; i < want.length; i++) {
    if (want[i].startsWith(':')) params[want[i].slice(1)] = decodeURIComponent(got[i])
    else if (want[i] !== got[i]) return null
  }
  return params
}
const ParamsContext = createContext<Record<string, string>>({})
/** Inside a page at '/collection/:id': const { id } = useParams() */
export function useParams(): Record<string, string> { return useContext(ParamsContext) }
/** One page per address: <Pages routes={{ '/': <Home />, '/collection': <Collection />, '/collection/:id': <ProductPage /> }} /> */
export function Pages({ routes, notFound }: { routes: Record<string, ReactNode>; notFound?: ReactNode }) {
  const path = usePage()
  for (const [pattern, page] of Object.entries(routes)) {
    const params = matchPath(pattern, path)
    if (params) return <ParamsContext.Provider value={params}>{page}</ParamsContext.Provider>
  }
  return <>{notFound ?? routes['/'] ?? null}</>
}
/** A link to another page of this site: <Link to="/collection" className="...">Collection</Link> */
export function Link({ to, children, className = '', title }: { to: string; children: ReactNode; className?: string; title?: string }) {
  const path = usePage()
  const external = /^(?:[a-z]+:|#|\/\/)/i.test(to)
  return (
    <a href={to} title={title} aria-current={!external && path === to ? 'page' : undefined} className={className}
      onClick={(e: ReactMouseEvent<HTMLAnchorElement>) => {
        if (external || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
        e.preventDefault()
        navigate(to)
      }}>
      {children}
    </a>
  )
}
