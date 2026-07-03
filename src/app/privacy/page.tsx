"use client";
import { useRouter } from "next/navigation";
import { T, SERIF, SANS, Icon, Card } from "@/glow/ui";

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: "100vh", background: T.bg, padding: "88px 20px 40px", position: "relative" }}>
      {/* Back button */}
      <button 
        onClick={() => router.back()} 
        style={{ 
          position: "fixed", 
          top: 56, 
          left: 14, 
          zIndex: 5, 
          width: 36, 
          height: 36, 
          borderRadius: 11, 
          background: T.surface, 
          border: `1px solid ${T.border}`, 
          cursor: "pointer", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          boxShadow: T.shadow 
        }}
      >
        <Icon name="chevL" size={18} color={T.text} sw={2.2} />
      </button>

      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontFamily: SERIF, fontSize: 38, color: T.text, margin: "0 0 8px", lineHeight: 1.1, fontWeight: 400 }}>
            Privacy Policy
          </h1>
          <p style={{ fontFamily: SANS, fontSize: 14, color: T.textMute, margin: 0 }}>
            Last updated: July 3, 2026
          </p>
        </div>

        {/* Content */}
        <Card style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
          <section>
            <p style={{ fontFamily: SANS, fontSize: 14.5, color: T.text, lineHeight: 1.6, margin: 0 }}>
              Welcome to <strong>Cream — AI Skin Care & Scanner</strong> ("we", "our", or "us"). 
              We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information when you use our website, mobile application, and related services.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: T.text, margin: "0 0 8px" }}>
              1. Information We Collect
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 14.5, color: T.textMute, lineHeight: 1.6, margin: 0 }}>
              We collect information to provide a personalized skincare experience, including:
            </p>
            <ul style={{ fontFamily: SANS, fontSize: 14.5, color: T.textMute, lineHeight: 1.6, paddingLeft: 20, margin: "8px 0 0" }}>
              <li><strong>Personal Profile Data:</strong> Name, email address, age, gender, and skin type when you register via Google Sign-In or fill out onboarding questions.</li>
              <li><strong>Photos & Camera Access:</strong> To perform face scans for skin concern analysis (like acne, oiliness, and pigmentation). Photos are processed securely and are never shared with third parties.</li>
              <li><strong>Skincare & Diet Logs:</strong> Information you record in your Daily Skin Diary, routine trackers, and customized diet plans.</li>
              <li><strong>Purchase & Subscription Data:</strong> In-app purchase history and subscription status tracked securely via <strong>Qonversion</strong>. We do not store your credit card details.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: T.text, margin: "0 0 8px" }}>
              2. How We Use Your Information
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 14.5, color: T.textMute, lineHeight: 1.6, margin: 0 }}>
              We use the collected information for the following purposes:
            </p>
            <ul style={{ fontFamily: SANS, fontSize: 14.5, color: T.textMute, lineHeight: 1.6, paddingLeft: 20, margin: "8px 0 0" }}>
              <li>To provide skin analysis report, daily AI skincare advice, and custom routines.</li>
              <li>To process and manage your premium subscriptions via Qonversion.</li>
              <li>To monitor app performance and improve the user experience using Firebase Analytics.</li>
              <li>To send you important push notifications and reminders (like drinking water or following your skincare routine).</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: T.text, margin: "0 0 8px" }}>
              3. Third-Party Services
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 14.5, color: T.textMute, lineHeight: 1.6, margin: 0 }}>
              We share data with trusted third-party service providers to enable app features:
            </p>
            <ul style={{ fontFamily: SANS, fontSize: 14.5, color: T.textMute, lineHeight: 1.6, paddingLeft: 20, margin: "8px 0 0" }}>
              <li><strong>Google:</strong> Used for secure user authentication (Google Sign-In).</li>
              <li><strong>Qonversion:</strong> Used to track, manage, and validate mobile app subscriptions and purchases.</li>
              <li><strong>Firebase:</strong> Used for user analytics, database hosting, and sending push notifications.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: T.text, margin: "0 0 8px" }}>
              4. Data Control and Deletion
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 14.5, color: T.textMute, lineHeight: 1.6, margin: 0 }}>
              You have complete control over your data. You can delete your account and all associated profile, diary, and analysis data directly from the **Profile** section of the app in one click. 
              Alternatively, you can request account deletion by emailing us at <a href="mailto:support@creameai.online" style={{ color: T.accentText, textDecoration: "underline" }}>support@creameai.online</a>.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: T.text, margin: "0 0 8px" }}>
              5. Contact Us
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 14.5, color: T.textMute, lineHeight: 1.6, margin: 0 }}>
              If you have any questions or feedback regarding this Privacy Policy, feel free to contact our support team at:
              <br />
              <strong>Email:</strong> <a href="mailto:support@creameai.online" style={{ color: T.accentText, textDecoration: "underline" }}>support@creameai.online</a>
            </p>
          </section>
        </Card>
      </div>
    </div>
  );
}
