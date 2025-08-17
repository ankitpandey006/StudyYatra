import React from 'react';
import { Instagram, Youtube, Linkedin, Facebook, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t mt-10 py-6 text-center">
      <div className="max-w-md mx-auto">
        {/* Logo */}
        <h2 className="text-2xl font-bold text-blue-600 mb-3">StudyYatra</h2>

        {/* Social Icons */}
        <div className="flex justify-center gap-6 mb-4 text-gray-600">
          <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram">
            <Instagram className="w-5 h-5 hover:text-pink-600 transition" />
          </a>
          <a href="https://www.youtube.com/" target="_blank" rel="noreferrer" aria-label="YouTube">
            <Youtube className="w-5 h-5 hover:text-red-600 transition" />
          </a>
          <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
            <Linkedin className="w-5 h-5 hover:text-blue-700 transition" />
          </a>
          <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook">
            <Facebook className="w-5 h-5 hover:text-blue-600 transition" />
          </a>
          <a href="https://www.twitter.com/" target="_blank" rel="noreferrer" aria-label="Twitter">
            <Twitter className="w-5 h-5 hover:text-sky-500 transition" />
          </a>
        </div>

        {/* Copyright */}
        <p className="text-xs text-gray-400">
          &copy; {new Date().getFullYear()} StudyYatra. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
