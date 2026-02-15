import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Youtube, Linkedin, Facebook, Twitter, Mail } from "lucide-react";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Brand Section */}
          <div>
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                StudyYatra
              </span>
            </Link>

            <p className="mt-3 text-sm text-slate-600 leading-relaxed max-w-md">
              Simple and reliable learning resources — Books, Notes, PYQs,
              Mock Tests and Audio content in Hindi & English.
            </p>

            {/* Contact */}
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
              <Mail className="h-4 w-4" />
              <a
                href="mailto:support@studyyatra.in"
                className="hover:text-indigo-700 transition"
              >
                support@studyyatra.in
              </a>
            </div>
          </div>

          {/* Social Section */}
          <div className="flex flex-col lg:items-end">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Follow Us
            </h3>

            <div className="flex flex-wrap items-center gap-3 text-slate-600">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="h-10 w-10 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:text-pink-600 transition"
              >
                <Instagram className="h-5 w-5" />
              </a>

              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="h-10 w-10 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:text-red-600 transition"
              >
                <Youtube className="h-5 w-5" />
              </a>

              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="h-10 w-10 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:text-blue-700 transition"
              >
                <Linkedin className="h-5 w-5" />
              </a>

              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="h-10 w-10 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:text-blue-600 transition"
              >
                <Facebook className="h-5 w-5" />
              </a>

              <a
                href="https://www.twitter.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                className="h-10 w-10 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:text-sky-500 transition"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-slate-200 text-center text-xs text-slate-500">
          © {year} StudyYatra. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;