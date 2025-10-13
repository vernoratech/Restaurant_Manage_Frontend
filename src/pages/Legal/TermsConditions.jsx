// src/pages/Legal/TermsConditions.jsx
import React from "react";
import { Link } from "react-router-dom";

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-sm rounded-xl p-8 space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Terms & Conditions
          </h1>
          <p className="text-gray-600">
            This is a placeholder terms and conditions page. Replace this
            content with your organisation's official terms before launching.
          </p>
        </header>

        <section className="space-y-4 text-gray-700">
          <p>
            By using this platform, you agree to comply with these terms and
            conditions. Use the services responsibly and refrain from any
            activities that could harm the platform or other users.
          </p>
          <p>
            This dummy page is for development purposes only. Ensure that your
            legal team provides the final wording.
          </p>
        </section>

        <footer className="pt-6 border-t border-gray-200 flex justify-between items-center">
          <span className="text-sm text-gray-500">Last updated: October 2025</span>
          <Link to="/register" className="text-sm text-blue-600 hover:text-blue-500">
            ← Back to Register
          </Link>
        </footer>
      </div>
    </div>
  );
};

export default TermsConditions;
