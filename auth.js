document.addEventListener('DOMContentLoaded', () => {
  setupNav();

  const tabs = document.querySelectorAll('[data-auth-mode]');
  const methodBtns = document.querySelectorAll('[data-method]');
  const roleBtns = document.querySelectorAll('[data-role]');
  const form = document.getElementById('authForm');
  const nameGroup = document.getElementById('nameGroup');
  const emailGroup = document.getElementById('emailGroup');
  const passwordGroup = document.getElementById('passwordGroup');
  const phoneGroup = document.getElementById('phoneGroup');
  const otpGroup = document.getElementById('otpGroup');
  const title = document.getElementById('authTitle');
  const submit = document.getElementById('authSubmit');
  const switchText = document.getElementById('switchText');
  const switchLink = document.getElementById('switchLink');

  let mode = new URLSearchParams(location.search).get('mode') === 'signup' ? 'signup' : 'login';
  let method = 'email';
  let role = 'receiver';

  function render() {
    tabs.forEach(button => button.classList.toggle('active', button.dataset.authMode === mode));
    methodBtns.forEach(button => button.classList.toggle('active', button.dataset.method === method));
    roleBtns.forEach(button => button.classList.toggle('active', button.dataset.role === role));

    title.textContent = mode === 'login' ? 'Welcome back' : 'Create your PlateForward account';
    submit.textContent = mode === 'login' ? 'Log in' : 'Create account';
    switchText.textContent = mode === 'login' ? 'New to PlateForward?' : 'Already have an account?';
    switchLink.textContent = mode === 'login' ? 'Sign up' : 'Log in';

    nameGroup.hidden = mode === 'login';
    emailGroup.hidden = method !== 'email';
    passwordGroup.hidden = method !== 'email';
    phoneGroup.hidden = method !== 'phone';
    otpGroup.hidden = method !== 'phone';

    document.getElementById('name').required = mode === 'signup';
    document.getElementById('email').required = method === 'email';
    document.getElementById('password').required = mode === 'signup' && method === 'email';
    document.getElementById('phone').required = method === 'phone';
    document.getElementById('otp').required = method === 'phone';
  }

  tabs.forEach(button => {
    button.addEventListener('click', () => {
      mode = button.dataset.authMode;
      render();
    });
  });

  methodBtns.forEach(button => {
    button.addEventListener('click', () => {
      method = button.dataset.method;
      render();
    });
  });

  roleBtns.forEach(button => {
    button.addEventListener('click', () => {
      role = button.dataset.role;
      render();
    });
  });

  switchLink.addEventListener('click', event => {
    event.preventDefault();
    mode = mode === 'login' ? 'signup' : 'login';
    render();
  });

  form.addEventListener('submit', event => {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const phone = document.getElementById('phone').value.trim();
    const otp = document.getElementById('otp').value.trim();
    const accounts = getAccounts();

    if (method === 'phone' && otp !== '123456') {
      showToast('Enter OTP here');
      return;
    }

    if (mode === 'signup') {
      if (!name) {
        showToast('Please enter your name');
        return;
      }

      const key = method === 'email' ? email : phone;
      if (!key) {
        showToast(`Please enter your ${method}`);
        return;
      }

      const exists = accounts.some(account => (method === 'email' ? account.email : account.phone) === key);
      if (exists) {
        showToast('Account already exists. Please log in.');
        return;
      }

      const account = {
        id: Date.now(),
        name,
        role,
        method,
        email: method === 'email' ? email : '',
        phone: method === 'phone' ? phone : '',
        password: method === 'email' ? password : '',
        createdAt: new Date().toISOString()
      };

      accounts.push(account);
      saveAccounts(accounts);
      setCurrentUser(account);
      showToast('Account created successfully');
      setTimeout(() => {
        location.href = role === 'donor' ? 'post.html' : 'browse.html';
      }, 500);
      return;
    }

    let account = null;

    if (method === 'email') {
      account = accounts.find(item => item.email === email && item.password === password);
    } else {
      account = accounts.find(item => item.phone === phone);
    }

    if (!account) {
      showToast(method === 'email' ? 'Invalid email or password' : 'Phone number not found. Sign up first.');
      return;
    }

    setCurrentUser(account);
    showToast('Welcome back');
    setTimeout(() => {
      location.href = account.role === 'donor' ? 'post.html' : 'browse.html';
    }, 500);
  });

  render();
});
