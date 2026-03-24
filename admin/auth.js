// auth.js - 管理者認証処理

const HASH_ID = '819e13cbc006bd179dc20c7c3d11d2b07075a07ed8f4ddd1172bb7840f46e9c7';
const HASH_PW = '6d6d906c653ea716bc4f15d81f6ca707b082d3a72834c35ad97e76ac3ef9a593';

const SESSION_KEY = 'admin_auth_ok';

/**
 * 文字列をSHA-256でハッシュ化（HEX文字列で返す）
 */
async function sha256(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * ログインフォームの送信処理
 */
async function handleLogin(event) {
  event.preventDefault();

  const idInput = document.getElementById('login-id').value.trim().toLowerCase();
  const pwInput = document.getElementById('login-pw').value;
  const errorMsg = document.getElementById('error-msg');

  errorMsg.classList.remove('visible');

  try {
    const [idHash, pwHash] = await Promise.all([sha256(idInput), sha256(pwInput)]);

    if (idHash === HASH_ID && pwHash === HASH_PW) {
      sessionStorage.setItem(SESSION_KEY, '1');
      window.location.href = 'index.html';
    } else {
      errorMsg.textContent = 'IDまたはパスワードが正しくありません。';
      errorMsg.classList.add('visible');
      document.getElementById('login-pw').value = '';
    }
  } catch (e) {
    errorMsg.textContent = '認証処理中にエラーが発生しました。';
    errorMsg.classList.add('visible');
  }
}

/**
 * 管理者ページへの直接アクセスを防止
 * admin/index.html の先頭で呼び出す
 */
function requireAuth() {
  if (sessionStorage.getItem(SESSION_KEY) !== '1') {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

/**
 * ログアウト
 */
function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.href = '../index.html';
}

// ページ種別によって初期化処理を切り替え
document.addEventListener('DOMContentLoaded', () => {
  const isLoginPage = document.getElementById('login-form');
  const isAdminPage = document.getElementById('admin-page');

  if (isLoginPage) {
    isLoginPage.addEventListener('submit', handleLogin);
  }

  const isEditPage = document.getElementById('edit-page');
  const isFinalPage = document.getElementById('final-page');

  if (isEditPage || isFinalPage || isAdminPage) {
    if (!requireAuth()) return;
  }

  // ログアウトボタン（全管理画面共通）
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
});
