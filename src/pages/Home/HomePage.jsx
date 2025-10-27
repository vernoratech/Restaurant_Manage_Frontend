// src/pages/Home/HomePage.jsx - Enhanced auth state handling
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import Button from '../../components/ui/Button.jsx'
import {
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiUsers,
  FiShield,
  FiHeart,
  FiMapPin,
  FiPhoneCall
} from 'react-icons/fi'
import { TbServerSpark } from "react-icons/tb";


const HomePage = () => {
  const { isAuthenticated, user, logout, isLoading } = useAuth()
  const navigate = useNavigate()
  const [billingCycle, setBillingCycle] = useState('monthly')

  const handleAuthAction = (path) => {
    if (isAuthenticated) {
      // If already logged in, go to dashboard instead of auth pages
      const setupCompleted = localStorage.getItem('restaurantSetupCompleted') === 'true'
      if (!setupCompleted) {
        navigate('/restaurant-setup')
      } else {
        navigate('/dashboard')
      }
    } else {
      // If not logged in, go to requested auth page
      navigate(path)
    }
  }

  const featureHighlights = [
    {
      title: 'Smart Dashboards',
      description: 'Monitor sales, covers, and kitchen load in a single real-time view.',
      icon: FiTrendingUp,
      accent: 'bg-blue-500/10 text-blue-500'
    },
    {
      title: 'Guest Experience',
      description: 'Reduce wait times, personalize service, and keep tables turning.',
      icon: FiUsers,
      accent: 'bg-purple-500/10 text-purple-500'
    },
    {
      title: 'Operational Control',
      description: 'Automate shift planning, stock checks, and staff communication.',
      icon: FiClock,
      accent: 'bg-amber-500/10 text-amber-500'
    },
    {
      title: 'Enterprise Grade Security',
      description: 'Built-in compliance, granular role permissions, and encrypted data.',
      icon: FiShield,
      accent: 'bg-emerald-500/10 text-emerald-500'
    }
  ]

  const workflowSteps = [
    {
      label: 'Menu & Inventory',
      detail: 'Sync dishes, pricing, allergens, and stock in minutes.'
    },
    {
      label: 'Table & Order Flow',
      detail: 'Route tickets instantly, coordinate FOH + BOH like clockwork.'
    },
    {
      label: 'Payments & Loyalty',
      detail: 'Capture secure payments, reward regulars, and upsell smarter.'
    },
    {
      label: 'Insights & Automation',
      detail: 'AI-driven forecasts, alerts, and automations save hours every week.'
    }
  ]

  const testimonials = [
    {
      quote:
        '“VernoraTech replaced four different tools for us. Labour planning takes 10 minutes and we finally have visibility on true margin per shift.”',
      author: 'Priya Malhotra',
      role: 'Owner, Spice Route Bistro'
    },
    {
      quote:
        '“The QR ordering and real-time kitchen board eliminated bottlenecks. We turned tables 22% faster last quarter.”',
      author: 'Daniel Brooks',
      role: 'GM, The Copper Spoon'
    },
    {
      quote:
        '“Implementation was painless. Their support team feels like an extension of ours, always available.”',
      author: 'Lucia Fernández',
      role: 'COO, Mercado Urbano Group'
    }
  ]

  const integrationBadges = [
    'Stripe',
    'Toast POS',
    'Square',
    'Xero',
    'DoorDash',
    'Uber Eats'
  ]

  const useCases = [
    {
      title: 'Fine Dining',
      subtitle: 'Elevate multi-course service',
      description:
        'Coordinate sommeliers, chefs, and front-of-house teams with real-time pacing, VIP alerts, and pairing suggestions.',
      icon: FiHeart
    },
    {
      title: 'Fast Casual',
      subtitle: 'Keep queues moving',
      description:
        'Enable contactless ordering, self-serve kiosks, and predictive kitchen prep to deliver orders under 8 minutes.',
      icon: FiClock
    },
    {
      title: 'Multi-Unit Groups',
      subtitle: 'Unify operations at scale',
      description:
        'Standardize menus, pricing, and reporting across regions with granular permissions and HQ-wide analytics.',
      icon: FiMapPin
    }
  ]

  const pricingPlans = [
    {
      name: 'Starter',
      badge: 'Best for new venues',
      highlighted: false,
      monthlyPrice: '$89',
      yearlyPrice: '$79',
      monthlyCaption: 'per location · billed monthly',
      yearlyCaption: 'per location · billed annually',
      trialText: '14-day free trial included',
      features: [
        'All core modules (menu, tables, staff)',
        'POS + delivery marketplace integrations',
        'Shift forecasting & labour guardrails',
        'Email support with 24h response'
      ]
    },
    {
      name: 'Growth',
      badge: 'Most popular',
      highlighted: true,
      monthlyPrice: '$199',
      yearlyPrice: '$179',
      monthlyCaption: 'per location · billed monthly',
      yearlyCaption: 'per location · billed annually (10% savings)',
      trialText: 'White-glove launch included',
      features: [
        'Unlimited team seats & advanced permissions',
        'Advanced analytics, exports, and forecasting',
        'Automated inventory re-order suggestions',
        'Priority support with <2h response time'
      ]
    },
    {
      name: 'Enterprise',
      badge: 'For multi-brand groups',
      highlighted: false,
      monthlyPrice: 'Custom',
      yearlyPrice: 'Custom',
      monthlyCaption: 'tailored pricing',
      yearlyCaption: 'multi-year partnership plans',
      trialText: 'Dedicated rollout team',
      features: [
        'Dedicated success architect & strategic reviews',
        'Custom integrations, SSO, and data warehouse feeds',
        '99.99% uptime SLA & compliance suite',
        'On-site training & 24/7 premium support'
      ]
    }
  ]
  const comparisonMatrix = [
    {
      label: 'Locations included',
      starter: 'Single location',
      growth: 'Unlimited locations',
      enterprise: 'Unlimited + regional rollups'
    },
    {
      label: 'Menu & ordering integrations',
      starter: 'POS + delivery partners',
      growth: 'Starter + loyalty & CRM',
      enterprise: 'Growth + custom API connectors'
    },
    {
      label: 'Analytics & forecasting',
      starter: 'Operational dashboards',
      growth: 'Predictive revenue & labour models',
      enterprise: 'Group-level forecasting & planning'
    },
    {
      label: 'Support & success',
      starter: 'Email (24h SLA)',
      growth: 'Priority (2h SLA)',
      enterprise: 'Dedicated consultant (24/7)'
    }
  ]

  const faqs = [
    {
      question: 'How fast can we launch VernoraTech?',
      answer:
        'Most single-location venues launch in under 48 hours. Multi-unit groups typically complete onboarding in 10 business days with our white-glove migration team.'
    },
    {
      question: 'Do you integrate with our existing POS and delivery partners?',
      answer:
        'Yes. We connect with leading POS systems (Toast, Square, Lightspeed), delivery marketplaces (DoorDash, Uber Eats), accounting tools, and custom APIs. Need a new integration? Our team will scope it for you.'
    },
    {
      question: 'Is there training for our staff?',
      answer:
        'Absolutely. We provide interactive product tours, role-specific onboarding, and live coaching sessions. Enterprise customers receive on-site launch support.'
    },
    {
      question: 'How does billing work for multiple locations?',
      answer:
        'You can add or remove locations at any time. Billing is prorated monthly per active location with consolidated invoicing for finance teams.'
    }
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-xl font-bold text-blue-400">
              VT
            </span>
            <div>
              <h1 className="text-xl font-semibold leading-tight text-white">VernoraTech</h1>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">RestaurantOS</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center gap-6 text-sm font-medium">
              <a href="#features" className="text-slate-300 transition hover:text-white">
                Features
              </a>
              <a href="#solutions" className="text-slate-300 transition hover:text-white">
                Solutions
              </a>
              <a href="#workflow" className="text-slate-300 transition hover:text-white">
                Workflow
              </a>
              <a href="#testimonials" className="text-slate-300 transition hover:text-white">
                Customers
              </a>
              <a href="#pricing" className="text-slate-300 transition hover:text-white">
                Pricing
              </a>
              <a href="#faq" className="text-slate-300 transition hover:text-white">
                FAQ
              </a>
              <a href="#about" className="text-slate-300 transition hover:text-white">
                About
              </a>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="text-sm text-slate-400">Loading...</div>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="hidden text-sm text-slate-300 sm:inline">Welcome back, {user?.name || 'User'}!</span>
                <Button className='cursor-pointer' onClick={() => navigate('/dashboard')} variant="primary" size="sm">
                  Dashboard
                </Button>
                <Button className='cursor-pointer' onClick={logout} variant="outline" size="sm">
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Button className='cursor-pointer' onClick={() => handleAuthAction('/login')} variant="outline">
                  Sign In
                </Button>
                <Button className='cursor-pointer' onClick={() => handleAuthAction('/register')} variant="primary">
                  Get Started
                </Button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-28 pb-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -left-40 top-20 h-72 w-72 rounded-full bg-blue-500/30 blur-3xl" />
          <div className="absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-purple-500/30 blur-3xl" />
        </div>

        <div className="mx-auto flex max-w-7xl flex-col gap-16 px-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div className="max-w-3xl space-y-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full px-4 py-1 text-sm border border-white/10 from-blue-500 to-blue-600 bg-gradient-to-r ">
                <TbServerSpark className="h-6 w-6" />
                <p className='font-bold text-xl'>'DEV' Environment</p>
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm text-blue-200 backdrop-blur">
                <FiTrendingUp className="h-4 w-4" />
                The operating system for modern restaurants
              </span>
              {isAuthenticated && (
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200 backdrop-blur">
                  Purchased
                </span>
              )}
            </div>
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Serve smarter nights
              <span className="block text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text">
                with VernoraTech RestaurantOS
              </span>
            </h1>
            <p className="text-lg text-slate-300 sm:text-xl">
              Consolidate menu, floor, staff, and guest experience into one sleek workspace. Unlock data-driven insights that increase covers, reduce waste, and keep your team in sync.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                className="flex w-full items-center justify-center gap-2 sm:w-auto cursor-pointer"
                onClick={() => handleAuthAction(isAuthenticated ? '/dashboard' : '/register')}
              >
                {isAuthenticated ? 'Open Your Dashboard' : 'Start My Free Trial'}
                <FiArrowRight className="h-5 w-5" />
              </Button>
              {!isAuthenticated && (
                <button
                  type="button"
                  onClick={() => handleAuthAction('/login')}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-sm font-medium text-slate-200 transition hover:border-white/40 hover:text-white sm:w-auto"
                >
                  Explore product tour
                </button>
              )}
            </div>

            <div className="grid gap-4 pt-6 sm:grid-cols-2">
              {[
                'Launch in under 48 hours with concierge onboarding',
                'Increase table turns by up to 22% with real-time ops',
                'Connect POS, delivery, payments & loyalty seamlessly',
                'Enterprise-grade security and 24/7 support included'
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-slate-300">
                  <FiCheckCircle className="mt-0.5 h-4 w-4 text-emerald-400" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative isolate flex-1">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/30 via-purple-500/25 to-emerald-400/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur">
              <div className="overflow-x-auto">
                <div className="flex min-w-[680px] flex-col gap-6 p-6 sm:min-w-[780px] sm:flex-row sm:items-stretch sm:p-8">
                  <div className="flex-1 space-y-6 sm:max-w-[55%]">
                    <div className="space-y-3">
                      <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] text-blue-200">
                        Tonight at Vernora
                      </span>
                      <h3 className="text-2xl font-semibold text-white sm:text-3xl">Signature experiences on the menu</h3>
                      <p className="text-sm text-slate-200 sm:text-base">
                        Curated pairings, culinary theatre, and a soundtrack designed for unforgettable evenings.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {[
                        {
                          title: 'Chef’s spotlight',
                          detail: 'Truffle lobster bisque with table-side pour and reserve Chardonnay pairing',
                          accent: 'bg-blue-500/20 text-blue-100'
                        },
                        {
                          title: 'Tasting flight',
                          detail: 'Heirloom tomato trio with citrus espuma and rosemary focaccia crisps',
                          accent: 'bg-purple-500/20 text-purple-100'
                        },
                        {
                          title: 'After-hours vibe',
                          detail: 'Vinyl DJ set & aperitivo cocktails from 9 PM',
                          accent: 'bg-emerald-500/20 text-emerald-100'
                        },
                        {
                          title: 'Spotlight cocktail',
                          detail: 'Smoked yuzu martini with gold dust rim and house bitters',
                          accent: 'bg-amber-500/20 text-amber-100'
                        }
                      ].map((item) => (
                        <div
                          key={item.title}
                          className="rounded-2xl border border-white/10 bg-white/5 p-4"
                        >
                          <div className={`mb-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${item.accent}`}>
                            {item.title}
                          </div>
                          <p className="text-sm leading-relaxed text-slate-200">{item.detail}</p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-emerald-400/20 p-4 text-xs font-semibold uppercase tracking-wide text-slate-200">
                      Reservations 78% full · private dining suites still available
                    </div>
                  </div>

                  <div className="flex-1 space-y-6 rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-slate-100 sm:max-w-[45%]">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-wide text-slate-400">
                        <span className="text-slate-300">Ambience snapshot</span>
                        <span>Golden hour · 7:45 PM</span>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {[
                          {
                            label: 'Active tables',
                            value: '42',
                            note: 'Premium lounge 95% seated'
                          },
                          {
                            label: 'Average spend',
                            value: '$74.60',
                            note: 'Seasonal upsell +18%'
                          },
                          {
                            label: 'Experience score',
                            value: '9.4/10',
                            note: 'Guests loving tableside desserts'
                          },
                          {
                            label: 'Waitlist',
                            value: '17 parties',
                            note: 'VIP notifications enabled'
                          }
                        ].map((stat) => (
                          <div key={stat.label} className="rounded-xl border border-white/5 bg-white/[0.05] p-4">
                            <div className="text-xs uppercase tracking-wide text-slate-400">{stat.label}</div>
                            <div className="mt-2 text-2xl font-semibold">{stat.value}</div>
                            <div className="mt-1 text-xs text-slate-300">{stat.note}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm leading-relaxed text-slate-200">
                      “Every service should feel like a signature evening. Vernora keeps the room glowing.”
                      <span className="mt-2 block text-xs uppercase tracking-wide text-slate-400">— GM, Skyline Rooftop</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">Feature Highlights</span>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
              Built for high-performing restaurant teams
            </h2>
            <p className="mt-3 text-lg text-slate-300">
              Modules designed to orchestrate front-of-house, back-of-house, and corporate operations together.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2">
            {featureHighlights.map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg backdrop-blur transition hover:-translate-y-2 hover:border-blue-400/40 hover:bg-white/10"
              >
                <div className={`mb-6 inline-flex rounded-2xl p-3 text-lg ${feature.accent}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm text-slate-300">{feature.description}</p>
                <div className="mt-6 flex items-center gap-2 text-sm font-medium text-blue-300">
                  Learn more
                  <FiArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-3xl border border-white/10 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-emerald-500/10 p-10 text-center backdrop-blur">
            <h3 className="text-2xl font-semibold text-white">Plays nicely with your existing stack</h3>
            <p className="mt-2 text-sm text-slate-300">
              Connect POS, delivery marketplaces, accounting suites, and loyalty programs via secure integrations.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-300">
              {integrationBadges.map((brand) => (
                <span
                  key={brand}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 uppercase tracking-wide"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">Use cases</span>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Engineered for every service style</h2>
            <p className="mx-auto max-w-3xl text-lg text-slate-300">
              Whether you run an intimate chef’s counter or a nationwide brand, VernoraTech adapts to your unique guest journey and operational rhythm.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {useCases.map((useCase) => (
              <div
                key={useCase.title}
                className="relative flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-left shadow-2xl backdrop-blur transition hover:-translate-y-2 hover:border-emerald-400/40"
              >
                <div className="inline-flex items-center gap-3 text-sm font-medium text-emerald-300">
                  <useCase.icon className="h-5 w-5" />
                  {useCase.subtitle}
                </div>
                <h3 className="text-2xl font-semibold text-white">{useCase.title}</h3>
                <p className="text-sm text-slate-300">{useCase.description}</p>
                <div className="mt-auto text-sm font-medium text-emerald-200">
                  Explore playbook →
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="workflow" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
                The playbook
              </span>
              <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
                Run every service with clarity and confidence
              </h2>
              <p className="mt-3 text-lg text-slate-300">
                Seamless workflows guide teams through prep, service, and closeout. Smart suggestions help you staff thoughtfully, order product proactively, and delight guests.
              </p>
              <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200">
                "We finally have a command center that everyone trusts. Our kitchen never misses a beat." — <span className="font-semibold text-white">Head Chef, Skyline Rooftop</span>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="grid gap-6">
                {workflowSteps.map((step, index) => (
                  <div
                    key={step.label}
                    className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur transition hover:border-blue-400/40"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-blue-500/10 text-sm font-semibold text-blue-300">
                        0{index + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{step.label}</h3>
                        <p className="mt-2 text-sm text-slate-300">{step.detail}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-300">Customer stories</span>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">Loved by ambitious hospitality teams</h2>
            <p className="mt-3 text-lg text-slate-300">
              From boutique dining rooms to multi-location groups, VernoraTech elevates every service.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.author}
                className="relative flex h-full flex-col gap-6 rounded-3xl border border-white/10 bg-white/[0.05] p-8 text-left shadow-lg backdrop-blur transition hover:-translate-y-2"
              >
                <div className="text-5xl text-blue-400/40">“</div>
                <p className="text-sm text-slate-200">{testimonial.quote}</p>
                <div className="mt-auto">
                  <div className="text-sm font-semibold text-white">{testimonial.author}</div>
                  <div className="text-xs uppercase tracking-wide text-slate-400">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* {isAuthenticated ? 'Open Your Dashboard' : 'Start My Free Trial'} */}

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">Pricing</span>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">Simple, transparent plans that scale with you</h2>
            <p className="mt-3 text-lg text-slate-300">
              Start free, upgrade only when you’re ready. No hidden fees, cancel anytime.
            </p>
          </div>

          <div className="mt-10 flex items-center justify-center gap-3 text-sm">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`rounded-full px-5 py-2 transition ${billingCycle === 'monthly'
                  ? 'bg-blue-500/80 text-white shadow-md shadow-blue-500/30'
                  : 'border border-white/10 bg-white/5 text-slate-300 hover:border-white/30 hover:text-white'
                }`}
            >
              Billed monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annually')}
              className={`rounded-full px-5 py-2 transition ${billingCycle === 'annually'
                  ? 'bg-blue-500/80 text-white shadow-md shadow-blue-500/30'
                  : 'border border-white/10 bg-white/5 text-slate-300 hover:border-white/30 hover:text-white'
                }`}
            >
              Billed annually <span className="ml-1 text-emerald-200">(Save up to 10%)</span>
            </button>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {pricingPlans.map((plan) => {
              const displayPrice = billingCycle === 'annually' ? plan.yearlyPrice : plan.monthlyPrice
              const caption = billingCycle === 'annually' ? plan.yearlyCaption : plan.monthlyCaption
              const isGrowthPlan = plan.name === 'Growth'
              const isEnterprisePlan = plan.name === 'Enterprise'
              const isStarterPlan = plan.name === 'Starter'
              const buttonLabel = isEnterprisePlan ? 'Book a consultation' : 'Start this plan'

              return (
                <div
                  key={plan.name}
                  className={`relative flex h-full flex-col gap-6 rounded-3xl border ${plan.highlighted
                      ? 'border-blue-400/50 bg-blue-500/15 shadow-blue-500/20'
                      : 'border-white/10 bg-white/[0.06]'
                    } p-8 text-left shadow-2xl backdrop-blur transition hover:-translate-y-2`}
                >
                  {plan.badge ? (
                    <span className="inline-flex w-fit rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-100">
                      {plan.badge}
                    </span>
                  ) : null}
                  <div>
                    <h3 className="text-2xl font-semibold text-white">{plan.name}</h3>
                    <div className="mt-2 text-4xl font-bold text-white">{displayPrice}</div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">{caption}</div>
                    {plan.trialText ? (
                      <div className="mt-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-blue-100">
                        {plan.trialText}
                      </div>
                    ) : null}
                  </div>
                  <ul className="space-y-3 text-sm text-slate-200">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <FiCheckCircle className="mt-0.5 h-4 w-4 text-emerald-300" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {isAuthenticated ? (
                    isGrowthPlan ? (
                      <div className="mt-auto rounded-2xl border border-green-400/40 bg-green-500/15 px-4 py-3 text-sm font-medium text-green-100">
                        Growth plan active — manage seats and billing in your dashboard.
                      </div>
                    ) : (
                      <Button
                        size="md"
                        disabled
                        aria-disabled
                        className={`mt-auto w-full cursor-not-allowed border border-white/10 bg-white/5 text-slate-300 opacity-60 ${plan.highlighted ? '' : ''
                          }`}
                      >
                        {isStarterPlan ? 'Switch to Starter (contact support)' : 'Contact sales for custom pricing'}
                      </Button>
                    )
                  ) : (
                    <Button
                      size="md"
                      className={`mt-auto w-full cursor-pointer ${plan.highlighted ? '' : 'border border-white/10 bg-transparent hover:border-white/30'
                        }`}
                      onClick={() => handleAuthAction(isEnterprisePlan ? '/contact' : '/register')}
                    >
                      {buttonLabel}
                    </Button>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-14 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur">
            <div className="grid grid-cols-1 gap-6 px-6 py-6 text-left text-sm text-slate-200 sm:grid-cols-4 sm:px-8">
              <div className="font-semibold uppercase tracking-wide text-slate-400">Compare features</div>
              <div className="hidden font-semibold text-white sm:block">Starter</div>
              <div className="hidden font-semibold text-white sm:block">Growth</div>
              <div className="hidden font-semibold text-white sm:block">Enterprise</div>
            </div>
            <div className="divide-y divide-white/5">
              {comparisonMatrix.map((row) => (
                <div key={row.label} className="grid grid-cols-1 gap-6 px-6 py-5 text-left text-sm sm:grid-cols-4 sm:px-8">
                  <div className="font-medium text-white">{row.label}</div>
                  <div className="text-slate-300 sm:border-l sm:border-white/5 sm:pl-6">{row.starter}</div>
                  <div className="text-slate-300 sm:border-l sm:border-white/5 sm:pl-6">{row.growth}</div>
                  <div className="text-slate-300 sm:border-l sm:border-white/5 sm:pl-6">{row.enterprise}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-300">FAQ</span>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">Answers for operators with big ambitions</h2>
            <p className="mt-3 text-lg text-slate-300">
              Still curious? Chat with our team anytime—we love swapping hospitality stories.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-white/10 bg-white/[0.05] p-6 text-left backdrop-blur transition hover:border-purple-400/40"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-white">
                  {faq.question}
                  <span className="text-sm font-medium text-purple-200 group-open:rotate-45 transition">+</span>
                </summary>
                <p className="mt-4 text-sm text-slate-300">{faq.answer}</p>
              </details>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-center gap-3 text-sm text-slate-400">
            <FiPhoneCall className="h-4 w-4" />
            Prefer to talk it through? <button type="button" onClick={() => handleAuthAction('/contact')} className="text-blue-200 underline-offset-4 hover:text-blue-100 hover:underline">Book a call</button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="relative py-24">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-600/40 via-blue-500/30 to-purple-500/40" />
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-100">Your next shift starts here</span>
          <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
            {isAuthenticated ? 'Welcome back!' : 'Ready to transform the way your restaurant operates?'}
          </h2>
          <p className="mt-3 text-lg text-blue-100/90">
            {isAuthenticated ? 'Open your dashboard' : 'Book a guided tour or dive straight into a 14-day free trial. Cancel anytime—keep the insights.'}
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="flex w-full items-center justify-center gap-2 sm:w-auto cursor-pointer"
              onClick={() => handleAuthAction('/register')}
            >
              {isAuthenticated ? 'Open your dashboard' : 'Start my free trial'}
              <FiArrowRight className="h-5 w-5" />
            </Button>
            {isAuthenticated ? null : (
              <button
                type="button"
                onClick={() => handleAuthAction('/login')}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/30 px-6 py-3 text-sm font-medium text-white backdrop-blur transition hover:border-white/60 sm:w-auto"
              >
                Talk to our team
              </button>
            )}
          </div>

          <div className="mt-8 grid gap-4 text-left sm:grid-cols-2">
            {[
              'Unlimited locations during onboarding',
              'White-glove migration from legacy systems',
              'Advanced insights and automations included',
              'Enterprise support with <15 min response SLA'
            ].map((benefit) => (
              <div key={benefit} className="flex items-start gap-2 text-sm text-blue-50">
                <FiCheckCircle className="mt-0.5 h-4 w-4 text-emerald-300" />
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="border-t border-white/5 bg-slate-950 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
            {/* Company Info */}
            <div>
              <Link to="/" className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-lg font-bold text-blue-400">
                  VT
                </span>
                <span className="text-lg font-semibold text-white">VernoraTech</span>
              </Link>
              <p className="mt-4 text-sm text-slate-400">
                Empowering restaurants with connected experiences that delight guests, energize teams, and increase profitability from day one.
              </p>
              <div className="mt-6 flex gap-3 text-xs text-slate-500">
                <span className="rounded-full border border-white/10 px-3 py-1">SOC2-ready</span>
                <span className="rounded-full border border-white/10 px-3 py-1">PCI compliant</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Product</h4>
              <ul className="mt-4 space-y-2 text-sm text-slate-400">
                <li><a href="#features" className="transition hover:text-white">Features</a></li>
                <li><a href="#workflow" className="transition hover:text-white">Workflow</a></li>
                <li><a href="#pricing" className="transition hover:text-white">Pricing</a></li>
                <li><a href="#testimonials" className="transition hover:text-white">Customers</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Resources</h4>
              <ul className="mt-4 space-y-2 text-sm text-slate-400">
                <li><a href="#help" className="transition hover:text-white">Help Center</a></li>
                <li><a href="#docs" className="transition hover:text-white">Implementation Guide</a></li>
                <li><a href="#api" className="transition hover:text-white">API Reference</a></li>
                <li><a href="#status" className="transition hover:text-white">System Status</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Let’s talk</h4>
              <ul className="mt-4 space-y-3 text-sm text-slate-400">
                <li>📧 support@vernoratech.com</li>
                <li>📱 +1 (555) 123-4567</li>
                <li>🌐 www.vernoratech.com</li>
              </ul>
              <p className="mt-4 text-xs text-slate-500">
                548 Market Street, Suite 71234, San Francisco, CA 94104
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 border-t border-white/5 pt-8 text-center">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} VernoraTech. All rights reserved. Built with ❤️ in California & Bengaluru.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
