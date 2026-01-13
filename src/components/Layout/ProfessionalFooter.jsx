import { Link } from "react-router-dom";

const ProfessionalFooter = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = {
    Company: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Blog", href: "/blog" },
    ],
    Explore: [
      { label: "Destinations", href: "/places" },
      { label: "Activities", href: "/activities" },
      { label: "City Tours", href: "/search?category=city-tours" },
      { label: "Food Experiences", href: "/search?category=food" },
    ],
    Support: [
      { label: "Help Center", href: "/help" },
      { label: "Contact", href: "/contact" },
      { label: "Safety", href: "/safety" },
      { label: "Terms", href: "/terms" },
    ],
  };

  const legalLinks = [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Cookies", href: "/cookies" },
  ];

  return (
    <footer className="bg-white/90 text-gray-700 border-t border-purple-100/70 dark:bg-[#120c1f] dark:text-gray-300 dark:border-[#2a1a45]" role="contentinfo">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <img src="/images/LOGO2.png" alt="MyGuide Logo" className="w-10 h-auto" />
            <span className="font-display text-lg text-gray-900 dark:text-white">MyGuide</span>
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
            Simple, trusted trips with local experts. Book experiences that feel personal.
          </p>
          </div>

          {Object.entries(footerSections).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{section}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-sm hover:text-primary-600 transition-colors dark:hover:text-primary-300">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-purple-100/70 dark:border-[#2a1a45]">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">Copyright {currentYear} MyGuide. All rights reserved.</div>
          <nav className="flex items-center gap-4" aria-label="Legal">
            {legalLinks.map((link) => (
              <Link key={link.label} to={link.href} className="text-xs text-gray-500 hover:text-primary-600 transition-colors dark:text-gray-400 dark:hover:text-primary-300">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default ProfessionalFooter;
