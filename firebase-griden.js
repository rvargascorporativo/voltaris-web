const firebaseConfig = {
  apiKey: "AIzaSyD5yoe5bl_u4AD4UT2aJmA3rQk86KKVJWo",
  authDomain: "gridenbolivia.firebaseapp.com",
  projectId: "gridenbolivia",
  storageBucket: "gridenbolivia.firebasestorage.app",
  messagingSenderId: "829778703180",
  appId: "1:829778703180:web:ca74494f370e6777dd55e9",
  measurementId: "G-4S77MHBCQ5"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

function openMobileMenu(){document.getElementById("mobileMenu")?.classList.add("active");document.getElementById("mobileMenuOverlay")?.classList.add("active")}
function closeMobileMenu(){document.getElementById("mobileMenu")?.classList.remove("active");document.getElementById("mobileMenuOverlay")?.classList.remove("active")}
function openAuth(){document.getElementById("authModal").style.display="flex";showAuthMessage("")}
function closeAuth(){document.getElementById("authModal").style.display="none"}
function showAuthMessage(message,isError=false){const box=document.getElementById("authMessage");if(!box)return;box.textContent=message;box.style.color=isError?"#dc2626":"#16a34a"}
function clearAuthFields(){const e=document.getElementById("email"),p=document.getElementById("password");if(e)e.value="";if(p)p.value=""}
function getAuthData(){const email=document.getElementById("email")?.value.trim();const password=document.getElementById("password")?.value.trim();return{email,password}}
function register(){const{email,password}=getAuthData();if(!email||!password){showAuthMessage("Completa correo y contraseña.",true);return}auth.createUserWithEmailAndPassword(email,password).then(()=>{showAuthMessage("Usuario creado correctamente.");clearAuthFields();setTimeout(closeAuth,900)}).catch(e=>showAuthMessage("Firebase: "+e.message,true))}
function login(){const{email,password}=getAuthData();if(!email||!password){showAuthMessage("Completa correo y contraseña.",true);return}auth.signInWithEmailAndPassword(email,password).then(()=>{showAuthMessage("Sesión iniciada correctamente.");clearAuthFields();setTimeout(closeAuth,900)}).catch(e=>showAuthMessage("Firebase: "+e.message,true))}
function logout(){auth.signOut().then(()=>{closeAuth();closeMobileMenu()}).catch(e=>showAuthMessage("Firebase: "+e.message,true))}

auth.onAuthStateChanged(user=>{
  const authNavLink=document.getElementById("authNavLink"),logoutLink=document.getElementById("logoutLink"),mobileAuthLink=document.getElementById("mobileAuthLink"),mobileLogoutLink=document.getElementById("mobileLogoutLink");
  if(user){const nombre=(user.email||"Usuario").split("@")[0];if(authNavLink)authNavLink.textContent="Hola, "+nombre;if(mobileAuthLink)mobileAuthLink.textContent="Hola, "+nombre;if(logoutLink)logoutLink.style.display="inline-block";if(mobileLogoutLink)mobileLogoutLink.style.display="block"}
  else{if(authNavLink)authNavLink.textContent="Mi cuenta";if(mobileAuthLink)mobileAuthLink.textContent="Mi cuenta";if(logoutLink)logoutLink.style.display="none";if(mobileLogoutLink)mobileLogoutLink.style.display="none"}
});

function requireLogin(){const user=auth.currentUser;if(!user){openAuth();showAuthMessage("Inicia sesión para guardar esta acción.",true);return null}return user}

async function saveFavorite(productId, productName){
  const user=requireLogin(); if(!user) return;
  try{
    await db.collection("usuarios").doc(user.uid).collection("favoritos").doc(productId).set({productId,productName,email:user.email,createdAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    await db.collection("metricas_productos").doc(productId).set({productId,productName,favoritos:firebase.firestore.FieldValue.increment(1),updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    alert("Modelo guardado en favoritos: "+productName);
  }catch(e){alert("No se pudo guardar. Revisa Firestore Rules. "+e.message)}
}

async function registerInterest(productId, productName){
  const user=requireLogin(); if(!user) return;
  const phone=prompt("Déjanos tu número de WhatsApp para contactarte por este modelo:");
  if(!phone) return;
  try{
    await db.collection("interesados").add({productId,productName,email:user.email,uid:user.uid,phone,createdAt:firebase.firestore.FieldValue.serverTimestamp(),source:window.location.pathname});
    await db.collection("metricas_productos").doc(productId).set({productId,productName,interesados:firebase.firestore.FieldValue.increment(1),updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    const text=encodeURIComponent("Hola Griden, estoy interesado/a en el modelo "+productName+". Mi número es "+phone+".");
    window.open("https://wa.me/59169969051?text="+text,"_blank");
  }catch(e){alert("No se pudo registrar el interés. Revisa Firestore Rules. "+e.message)}
}

async function trackView(productId, productName){
  try{await db.collection("metricas_productos").doc(productId).set({productId,productName,vistas:firebase.firestore.FieldValue.increment(1),updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true})}catch(e){console.warn("No se pudo registrar vista",e.message)}
}

function filterProducts(tag, btn){
  document.querySelectorAll(".filter-btn").forEach(b=>b.classList.remove("active"));
  btn?.classList.add("active");
  document.querySelectorAll(".producto").forEach(card=>{const tags=card.dataset.tags||"";card.style.display=(tag==="all"||tags.includes(tag))?"block":"none"})
}

window.addEventListener("click",e=>{const modal=document.getElementById("authModal");if(e.target===modal)closeAuth()});
