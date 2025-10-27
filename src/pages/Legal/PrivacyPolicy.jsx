// src/pages/Legal/PrivacyPolicy.jsx
import React from "react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-sm rounded-xl p-8 space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-600">
            This is a placeholder privacy policy. Replace this content with your
            organisation's official policy when available.
          </p>
        </header>

        <section className="space-y-4 text-gray-700">
          <p>
            We value your privacy. Any personal information collected through
            this platform will be used solely to provide and improve our
            services. By using this site, you agree to the collection and use of
            information in accordance with this policy.
          </p>
          <p>
            This dummy page is intended for demonstration purposes and should be
            updated with real legal content prior to launch.
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

export default PrivacyPolicy;
