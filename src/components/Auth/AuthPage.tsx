import { useState } from 'react';
import SignIn from './SignIn';
import SignUp from './SignUp';
import ForgotPassword from './ForgotPassword';

type AuthView = 'signin' | 'signup' | 'forgot-password';

export default function AuthPage() {
  const [view, setView] = useState<AuthView>('signin');

  return (
    <>
      {view === 'signin' && (
        <SignIn
          onSwitchToSignUp={() => setView('signup')}
          onShowForgotPassword={() => setView('forgot-password')}
        />
      )}
      {view === 'signup' && (
        <SignUp onSwitchToSignIn={() => setView('signin')} />
      )}
      {view === 'forgot-password' && (
        <ForgotPassword onBack={() => setView('signin')} />
      )}
    </>
  );
}

