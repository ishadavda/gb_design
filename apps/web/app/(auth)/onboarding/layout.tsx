/**
 * Shared chrome for every onboarding screen. A layout is a Server Component and
 * does not re-render when you move between the steps inside it.
 *
 * (auth) is a ROUTE GROUP - the parentheses mean it groups files without adding
 * a URL segment. These pages live at /onboarding, not /auth/onboarding.
 *
 * This is only the phone-shaped viewport. The registration header, step counter
 * and footer dots belong to the setup flow rather than to every screen inside
 * it - the splash has none of them - so they live in _components/SetupShell.
 */
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mobile-frame relative flex min-h-screen w-full flex-col overflow-hidden md:h-[900px] md:max-h-[900px] md:min-h-[900px]">
      {children}
    </main>
  );
}
