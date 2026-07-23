const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navbar.classList.add(
      "bg-neutral/90",
      "backdrop-blur",
      "text-neutral-content",
      "shadow-lg",
    );
    navbar.classList.remove("bg-transparent", "text-base-content");
  } else {
    navbar.classList.add("bg-transparent", "text-base-content");
    navbar.classList.remove(
      "bg-neutral/90",
      "backdrop-blur",
      "text-neutral-content",
      "shadow-lg",
    );
  }
});

let fadeObserver;

document.addEventListener("DOMContentLoaded", function () {
  // สร้าง Observer
  fadeObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries.filter((entry) => entry.isIntersecting);

      visibleEntries.forEach((entry, index) => {
        setTimeout(() => {
          entry.target.classList.remove(
            "opacity-0",
            "-translate-x-12",
            "translate-x-12",
          );
          entry.target.classList.add("opacity-100", "translate-x-0");
        }, index * 300);

        fadeObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.1,
    },
  );

  // สั่งทำงานครั้งแรกตอนโหลดหน้าเว็บ
  const fadeItems = document.querySelectorAll(".fade-item");
  fadeItems.forEach((el) => fadeObserver.observe(el));
});

let currentLang = "th"; // ภาษากำหนดตั้งต้น
let translations = {}; // สร้างตัวแปรว่างๆ ไว้เก็บข้อมูลที่จะดึงมาจากไฟล์ JSON

// 1. ฟังก์ชันโหลดไฟล์ JSON แบบ Async
async function loadTranslations(lang) {
  try {
    const response = await fetch(`./json/${lang}.json`);
    if (!response.ok) throw new Error("ไม่สามารถโหลดไฟล์ภาษาได้");

    translations = await response.json(); // แปลงข้อความที่ดึงมาให้อยู่ในรูปแบบ Object
    applyLanguage(lang); // โหลดข้อมูลเสร็จแล้ว ค่อยสั่งให้เปลี่ยนข้อความบนหน้าเว็บ
  } catch (error) {
    console.error("Error loading translation file:", error);
  }
}

// 2. ฟังก์ชันสำหรับไล่เปลี่ยนข้อความบนหน้าเว็บ
function applyLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang; // อัปเดตภาษาของแท็ก <html>

  const elements = document.querySelectorAll("[data-i18n]");
  elements.forEach((el) => {
    // ดึงค่ามา เช่น "nav.home" แล้วแตกออกเป็น Array ["nav", "home"]
    const keyString = el.getAttribute("data-i18n");
    const keys = keyString.split(".");

    let value = translations;
    for (const key of keys) {
      value = value ? value[key] : undefined;
    }

    if (value) {
      el.innerText = value;
    }
  });

  // อัปเดตข้อความและธงชาติบนปุ่มสลับภาษา
  const btnLang = document.getElementById("btn-lang");
  if (btnLang) {
    if (lang === "th") {
      // ถ้าหน้าเว็บเป็นไทย -> ปุ่มโชว์ธงอังกฤษ + คำว่า EN เพื่อให้กดสลับ
      btnLang.innerHTML = `<img src="https://flagcdn.com/w20/gb.png" class="w-5 h-auto rounded-sm shadow-sm" alt="EN"> EN`;
    } else {
      // ถ้าหน้าเว็บเป็นอังกฤษ -> ปุ่มโชว์ธงไทย + คำว่า TH เพื่อให้กดสลับ
      btnLang.innerHTML = `<img src="https://flagcdn.com/w20/th.png" class="w-5 h-auto rounded-sm shadow-sm" alt="TH"> TH`;
    }
  }
}

// 3. ฟังก์ชันสลับภาษาเมื่อกดปุ่ม
function toggleLanguage() {
  const newLang = currentLang === "th" ? "en" : "th";
  loadTranslations(newLang);
}

// 4. ตรวจจับภาษาของเครื่องเมื่อเว็บโหลดเสร็จ
document.addEventListener("DOMContentLoaded", () => {
  // เช็คภาษาหลักของเบราว์เซอร์
  const userLang = navigator.language || navigator.userLanguage;

  // ถ้าภาษาเบราว์เซอร์ขึ้นต้นด้วย 'en' ให้ใช้ภาษาอังกฤษ ถ้าไม่ใช่ให้เป็นไทย
  const initialLang = userLang.toLowerCase().startsWith("en") ? "en" : "th";

  // เริ่มต้นด้วยการเรียกฟังก์ชันโหลดไฟล์ JSON
  loadTranslations(initialLang);
});

// ฟังก์ชันสลับหน้าเว็บ (SPA)
function switchPage(targetPageId) {
  const allPages = document.querySelectorAll(".spa-page");
  allPages.forEach((page) => {
    // ซ่อนหน้า
    page.classList.add("hidden");
    page.classList.remove("block");

    const items = page.querySelectorAll(".fade-item");
    items.forEach((el) => {
      el.classList.remove("opacity-100", "translate-x-0");

      if (el.dataset.direction === "right") {
        el.classList.add("opacity-0", "translate-x-12");
      } else {
        el.classList.add("opacity-0", "-translate-x-12");
      }
    });
  });

  // 2. แสดงเฉพาะหน้าที่เลือก
  const targetPage = document.getElementById("page-" + targetPageId);
  targetPage.classList.remove("hidden");
  targetPage.classList.add("block");

  window.scrollTo(0, 0);

  // 4. ปล่อยให้เบราว์เซอร์จัด Layout (Render) ให้เสร็จก่อน 50ms แล้วค่อยสั่ง Observer ทำงาน
  setTimeout(() => {
    const targetFadeItems = targetPage.querySelectorAll(".fade-item");
    targetFadeItems.forEach((el) => {
      if (fadeObserver) {
        fadeObserver.observe(el);
      }
    });
  }, 50);
}

function updateActiveDot(carouselId, activeIndex) {
  const dotsContainer = document.getElementById("dots-" + carouselId);
  if (!dotsContainer) return;

  const dots = dotsContainer.querySelectorAll("button");
  dots.forEach((dot, index) => {
    if (index === activeIndex) {
      dot.classList.remove("bg-gray-300");
      dot.classList.add("bg-primary", "scale-125");
    } else {
      dot.classList.remove("bg-primary", "scale-125");
      dot.classList.add("bg-gray-300");
    }
  });
}

// ฟังก์ชันเลื่อนรูปซ้าย-ขวา
function moveCarousel(carouselId, direction) {
  const carousel = document.getElementById(carouselId);
  if (!carousel) return;

  const clientWidth = carousel.clientWidth; // ความกว้างของ 1 ภาพ
  const scrollWidth = carousel.scrollWidth; // ความกว้างรวมของทุกภาพ

  // คำนวณหาว่ามีทั้งหมดกี่ภาพ และตอนนี้อยู่ภาพที่เท่าไหร่
  const totalSlides = Math.round(scrollWidth / clientWidth);
  const currentIndex = Math.round(carousel.scrollLeft / clientWidth);

  let targetIndex;

  if (direction === "prev") {
    // ถ้ากด prev: เช็คว่าอยู่ภาพแรก (0) หรือเปล่า ถ้าใช่ให้กระโดดไปภาพสุดท้าย ถ้าไม่ใช่ให้ถอย 1
    targetIndex = currentIndex === 0 ? totalSlides - 1 : currentIndex - 1;
  } else {
    // ถ้ากด next: เช็คว่าอยู่ภาพสุดท้ายหรือเปล่า ถ้าใช่ให้กระโดดกลับไปภาพแรก (0) ถ้าไม่ใช่ให้เดินหน้า 1
    targetIndex = currentIndex === totalSlides - 1 ? 0 : currentIndex + 1;
  }

  // สั่งให้เลื่อนไปที่ตำแหน่งของภาพเป้าหมาย
  carousel.scrollTo({ left: targetIndex * clientWidth, behavior: "smooth" });
}

// ฟังก์ชันสำหรับกดที่จุด Dot แล้วข้ามไปรูปนั้นๆ
function jumpToSlide(carouselId, slideIndex) {
  const carousel = document.getElementById(carouselId);
  const scrollAmount = carousel.clientWidth;
  carousel.scrollTo({ left: scrollAmount * slideIndex, behavior: "smooth" });
}

document.addEventListener("DOMContentLoaded", () => {
  // ลิสต์ ID ของ Carousel ทั้งหมดในหน้าเว็บ
  const carousels = ["carousel-proj1", "carousel-proj2"];

  carousels.forEach((id) => {
    const carousel = document.getElementById(id);
    if (carousel) {
      carousel.addEventListener("scroll", () => {
        // คำนวณว่าตอนนี้ตำแหน่งเลื่อนอยู่ตรงกับรูปที่เท่าไหร่
        const slideIndex = Math.round(
          carousel.scrollLeft / carousel.clientWidth,
        );
        updateActiveDot(id, slideIndex);
      });
    }
  });
});

function toggleMobileMenu() {
  const menu = document.getElementById("mobile-menu");

  if (menu.classList.contains("opacity-0")) {
    menu.classList.remove("opacity-0", "scale-95", "pointer-events-none");
    menu.classList.add("opacity-100", "scale-100");
  } else {
    closeMobileMenu();
  }
}

function closeMobileMenu() {
  const menu = document.getElementById("mobile-menu");
  menu.classList.add("opacity-0", "scale-95", "pointer-events-none");
  menu.classList.remove("opacity-100", "scale-100");
}
