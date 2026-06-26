import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Smartphone, Wrench, Shield, DollarSign, Clock, HelpCircle, 
  ChevronDown, ChevronUp, MapPin, Phone, ShieldCheck, Award, 
  Eye, Star, Battery, Volume2, Camera, Zap, CheckCircle2,
  ChevronRight, Laptop, MessageSquare
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user && user.roles && user.roles.length > 0) {
      const role = user.roles[0];
      if (role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else if (role === 'ROLE_SHOP_OWNER') {
        navigate('/shop');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const servicesList = [
    {
      id: 'screen',
      name: 'Screen Replacement',
      icon: <Smartphone className="h-6 w-6 text-sky-400" />,
      desc: 'Cracked, broken, or unresponsive touch displays replaced on-site.'
    },
    {
      id: 'battery',
      name: 'Battery Replacement',
      icon: <Battery className="h-6 w-6 text-green-400" />,
      desc: 'Quick draining, swelling, or non-charging batteries replaced.'
    },
    {
      id: 'camera',
      name: 'Camera Repairs',
      icon: <Camera className="h-6 w-6 text-indigo-400" />,
      desc: 'Blurry lens, autofocus failure, or black screen camera fixes.'
    },
    {
      id: 'speaker',
      name: 'Speaker & Mic Repair',
      icon: <Volume2 className="h-6 w-6 text-yellow-400" />,
      desc: 'Low sound, crackling speaker, or mic issues resolved on-site.'
    },
    {
      id: 'charging',
      name: 'Charging Port Fix',
      icon: <Zap className="h-6 w-6 text-orange-400" />,
      desc: 'Loose connections or complete charging failures repaired.'
    },
    {
      id: 'other',
      name: 'Other Problems',
      icon: <Wrench className="h-6 w-6 text-pink-400" />,
      desc: 'Water damage, software bugs, buttons, and custom diagnostics.'
    }
  ];

  const whyChooseUs = [
    {
      title: 'Transparent Work',
      desc: '100% visible repairs done right in front of you at your home or office.',
      icon: <Eye className="h-8 w-8 text-sky-400" />,
      bgColor: 'bg-sky-500/10',
      borderColor: 'border-sky-500/20'
    },
    {
      title: '6-Month Warranty',
      desc: 'Peace of mind with a comprehensive 6-month warranty on certified parts.',
      icon: <Award className="h-8 w-8 text-green-400" />,
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    },
    {
      title: 'Certified Technicians',
      desc: 'Expert technicians with verified backgrounds and specialized mobile training.',
      icon: <ShieldCheck className="h-8 w-8 text-indigo-400" />,
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20'
    },
    {
      title: 'Quick 60-Min Fix',
      desc: 'No waiting for days; get your phone repaired in less than an hour at your doorstep.',
      icon: <Clock className="h-8 w-8 text-yellow-400" />,
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20'
    }
  ];

  const faqs = [
    {
      q: 'Can I book a mobile repair service online in Indore?',
      a: 'Yes, you can conveniently book our mobile repair service online. Simply choose your service, select a preferred date and time, and our expert technician will visit your home or office to fix your device.'
    },
    {
      q: 'What types of mobile devices do you repair at home?',
      a: 'We provide repair services for all major brands of smartphones and tablets (Apple, Samsung, OnePlus, Xiaomi, Realme, Vivo, Oppo, etc.) at your doorstep.'
    },
    {
      q: 'How long does it take to repair a smartphone with FixMyPhone?',
      a: 'Most repairs, such as screen or battery replacements, are completed within 45 to 60 minutes of the technician\'s arrival at your home or office.'
    },
    {
      q: 'Does FixMyPhone provide a warranty for its repairs?',
      a: 'Absolutely! We stand behind the quality of our repairs with a comprehensive 6-month warranty on all certified spare parts, providing you with peace of mind.'
    },
    {
      q: 'Are the technicians experienced and verified?',
      a: 'Yes, all our doorstep technicians are highly experienced, hold professional certifications, and undergo background verification so your device is in safe hands.'
    },
    {
      q: 'Does the technician perform the repair in front of me?',
      a: 'Yes, we believe in 100% transparency. The technician will perform the entire repair process right in front of you at your home or office.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-sky-500/30">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Smartphone className="h-8 w-8 text-sky-400 mr-2" />
              <span className="font-extrabold text-xl tracking-wider bg-gradient-to-r from-sky-400 to-indigo-500 bg-clip-text text-transparent">
                FixMyPhone
              </span>
              <span className="ml-3 hidden sm:inline-block px-2.5 py-0.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-full text-xs font-bold">
                Indore Doorstep
              </span>
            </div>
            <div className="flex space-x-4">
              <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition">
                Sign In
              </Link>
              <Link to="/register" className="px-4 py-2 text-sm font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-lg shadow-sky-500/20 transition">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-sky-500/5 rounded-full filter blur-3xl -z-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-slate-950/50 border border-slate-800 px-3.5 py-1.5 rounded-full mb-6">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-semibold text-slate-300">#1 Doorstep Mobile Repair Service in Indore</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Doorstep Mobile Repair <br />
            <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
              In Indore at Home
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Say goodbye to visiting crowded repair shops. Our certified technicians come to your home or office in Indore and repair your device in under 60 minutes. Fully transparent, safe, and backed by warranty.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/book/1" className="w-full sm:w-auto px-8 py-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-xl shadow-sky-500/10 transition flex items-center justify-center space-x-2">
              <span>Book Doorstep Repair</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link to="/shops" className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700 transition">
              Find Repair Shops
            </Link>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto pt-8 border-t border-slate-800/80">
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-sky-400">10,000+</span>
              <span className="text-xs text-slate-500 mt-1 font-semibold">Repairs Completed</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-sky-400">60 Mins</span>
              <span className="text-xs text-slate-500 mt-1 font-semibold">Avg. Repair Time</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-sky-400">6 Months</span>
              <span className="text-xs text-slate-500 mt-1 font-semibold">Warranty Provided</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-sky-400">4.9/5 ⭐</span>
              <span className="text-xs text-slate-500 mt-1 font-semibold">Customer Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="py-16 bg-slate-950/40 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight">Our Doorstep Repair Services</h2>
            <p className="text-slate-400 mt-3 leading-relaxed">
              We fix all major smartphone problems on the spot. Pick your issue to begin booking your doorstep service.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicesList.map((service, index) => (
              <div 
                key={index} 
                className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl hover:border-sky-500/40 transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-4 group-hover:bg-sky-500/10 transition-colors">
                  {service.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-sky-400 transition-colors">{service.name}</h3>
                <p className="text-slate-400 text-sm mb-5 leading-relaxed">{service.desc}</p>
                <Link 
                  to="/book/1" 
                  className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center space-x-1"
                >
                  <span>Book Now</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight">Why Choose FixMyPhone Indore?</h2>
            <p className="text-slate-400 mt-3 leading-relaxed">
              We bring the repair shop directly to you, making mobile repairs secure, transparent, and quick.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, index) => (
              <div 
                key={index} 
                className={`bg-slate-900/60 border ${item.borderColor} p-6 rounded-2xl hover:bg-slate-900 transition-colors relative overflow-hidden`}
              >
                <div className={`w-14 h-14 ${item.bgColor} rounded-full flex items-center justify-center mb-5`}>
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-slate-950/40 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight">How Doorstep Repair Works</h2>
            <p className="text-slate-400 mt-3 leading-relaxed">
              Get your mobile device repaired in 3 simple, stress-free steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-16 h-16 bg-sky-600 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-sky-500/20 mb-6">
                1
              </div>
              <h3 className="text-lg font-bold mb-2">Book Service Online</h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                Select your mobile brand, model, and the issues you are facing to get a quote.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-16 h-16 bg-sky-600 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-sky-500/20 mb-6">
                2
              </div>
              <h3 className="text-lg font-bold mb-2">Technician Visits</h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                Our certified technician visits your doorstep at your selected date and time.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-16 h-16 bg-sky-600 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-sky-500/20 mb-6">
                3
              </div>
              <h3 className="text-lg font-bold mb-2">Repaired in 60 Mins</h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                The technician repairs your smartphone right in front of you. Test it, then pay!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Indore Locations Coverage */}
      <section className="py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-sky-500/5 rounded-full filter blur-3xl -z-10"></div>
            <div className="mb-6 md:mb-0 max-w-xl text-center md:text-left">
              <div className="inline-flex items-center space-x-2 bg-sky-500/10 text-sky-400 px-3 py-1 rounded-full text-xs font-semibold mb-4">
                <MapPin className="h-3.5 w-3.5" />
                <span>Indore & Surrounding Areas</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Active Doorstep Coverage</h2>
              <p className="text-slate-400 mt-2 text-sm sm:text-base leading-relaxed">
                Our technicians actively cover Indore City, Vijay Nagar, Palasia, Rajendra Nagar, Mhow, Rau, Bypass, and surrounding regions.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
              <Link to="/book/1" className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-lg transition text-center">
                Book in My Area
              </Link>
              <a href="tel:+917665974923" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition flex items-center justify-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>Call Support</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section className="py-16 bg-slate-950/40 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight">Frequently Asked Questions</h2>
            <p className="text-slate-400 mt-3 text-sm">
              Got questions? We have answers. Find out how doorstep mobile repair works.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className="font-bold text-base text-slate-200 group-hover:text-white transition-colors">
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="h-5 w-5 text-sky-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-500" />
                    )}
                  </button>
                  
                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? 'max-h-48 border-t border-slate-800/60' : 'max-h-0'
                    }`}
                  >
                    <div className="px-6 py-4 text-slate-400 text-sm leading-relaxed">
                      {faq.a}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center">
                <Smartphone className="h-7 w-7 text-sky-400 mr-2" />
                <span className="font-extrabold text-lg text-white">FixMyPhone</span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">
                Premium, reliable, and convenient doorstep mobile phone repair service in Indore.
              </p>
              <div className="flex space-x-3 text-slate-400 text-sm pt-2">
                <span>Indore</span>
                <span>•</span>
                <span>Mhow</span>
                <span>•</span>
                <span>Rau</span>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Quick Links</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li><Link to="/book/1" className="hover:text-sky-400 transition-colors">Book a Repair</Link></li>
                <li><Link to="/shops" className="hover:text-sky-400 transition-colors">Local Shops</Link></li>
                <li><Link to="/login" className="hover:text-sky-400 transition-colors">Customer Login</Link></li>
                <li><Link to="/register" className="hover:text-sky-400 transition-colors">Register Account</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Services</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li><a href="#services" className="hover:text-sky-400 transition-colors">Screen Replacement</a></li>
                <li><a href="#services" className="hover:text-sky-400 transition-colors">Battery Replacement</a></li>
                <li><a href="#services" className="hover:text-sky-400 transition-colors">Speaker & Microphone Repairs</a></li>
                <li><a href="#services" className="hover:text-sky-400 transition-colors">Camera & Charging Port Fix</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Contact Support</h4>
              <ul className="space-y-2.5 text-xs text-slate-500">
                <li className="flex items-center space-x-2">
                  <Phone className="h-3.5 w-3.5 text-sky-500" />
                  <a href="tel:+917665974923" className="hover:text-white transition-colors">+91-7665974923</a>
                </li>
                <li className="flex items-center space-x-2">
                  <MessageSquare className="h-3.5 w-3.5 text-green-500" />
                  <a href="https://wa.me/917665974923" className="hover:text-white transition-colors">WhatsApp Chat</a>
                </li>
                <li className="text-slate-600">
                  Hours: 9:00 AM - 7:00 PM (Mon - Sun)
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-900 text-center text-xs text-slate-600 flex flex-col sm:flex-row justify-between items-center">
            <span>© 2026 FixMyPhone. All rights reserved.</span>
            <div className="flex space-x-4 mt-4 sm:mt-0">
              <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
