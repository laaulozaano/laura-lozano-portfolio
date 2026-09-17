
/*=========================
MENÚ DESPLEGABLE
=========================*/

const menuToggle = document.getElementById("menuToggle");
const menuOverlay = document.getElementById("menuOverlay");
const menuLinks = document.querySelectorAll(".menu-overlay-links a");

if (menuToggle && menuOverlay) {

    menuToggle.addEventListener("click", () => {

        menuToggle.classList.toggle("active");
        menuOverlay.classList.toggle("active");

        document.body.classList.toggle("menu-open");

    });

    menuLinks.forEach((link) => {

        link.addEventListener("click", () => {

            menuToggle.classList.remove("active");
            menuOverlay.classList.remove("active");

            document.body.classList.remove("menu-open");

        });

    });

}


/*=========================
NOMBRE PARTIDO + CARRUSEL AUTOMÁTICO
(solo en móvil/tablet, donde no hay hover para el rastro de imágenes)
=========================*/

const heroSection = document.getElementById("hero");
const autoGallery = document.getElementById("heroAutoGallery");
const isSmallScreen = window.matchMedia("(max-width: 900px)").matches;

if (heroSection && autoGallery && isSmallScreen) {

    // "Laura" se rellena a los .3s+1s, "Lozano" justo después, a los 2.3s —
    // esperamos a que las dos hayan terminado antes de separarlas
    setTimeout(() => {
        heroSection.classList.add("split");
        autoGallery.classList.add("show");

        const slides = autoGallery.querySelectorAll(".hero-auto-slide");
        let current = 0;

        setInterval(() => {
            slides[current].classList.remove("active");
            current = (current + 1) % slides.length;
            slides[current].classList.add("active");
        }, 1400);

    }, 2500);
}

/*=========================
CURSOR PERSONALIZADO
=========================*/

const cursor = document.getElementById("cursor");
const canHover = window.matchMedia("(hover:hover)").matches;

if (cursor && canHover) {

    let cx = 0, cy = 0, tx = 0, ty = 0;

    document.addEventListener("mousemove", (e) => {
        tx = e.clientX;
        ty = e.clientY;
    });

    function moveCursor() {
        cx += (tx - cx) * 0.2;
        cy += (ty - cy) * 0.2;
        cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%,-50%)`;
        requestAnimationFrame(moveCursor);
    }
    requestAnimationFrame(moveCursor);

    document.querySelectorAll("a, button, .float-item").forEach((el) => {
        el.addEventListener("mouseenter", () => cursor.classList.add("active"));
        el.addEventListener("mouseleave", () => cursor.classList.remove("active"));
    });
}

/*=========================
RASTRO DE IMÁGENES SOBRE EL NOMBRE
Aparecen siguiendo al cursor y se desvanecen solas,
no se quedan acumuladas en pantalla.
=========================*/

if (canHover) {

    const heroSection = document.querySelector(".hero");
    const trailImages = [
        "img/mamatfg.png",
        "img/LOZANO.LAURA_3.1_ZAPATILLA_RENDERL1.jpg",
        "img/CASICASI3.jpg",
        "img/portada libro.png",
        "img/mockup cerveza cabeza.png",
        "img/Log-Lady.jpg",
        "img/FOLLETO.png",
        "img/0_0056.png",
        "img/mockup latas.jpg",
        "img/caja grande.png",
        "img/MK2.png",
    ];

    let trailIndex = 0;
    let lastSpawn = 0;
    const spawnGap = 150;  // ms mínimo entre imágenes — más bajo = rastro más denso y rápido
    const lifeTime = 380; // ms que la imagen permanece visible antes de desvanecerse

    heroSection?.addEventListener("mousemove", (e) => {
        const now = performance.now();
        if (now - lastSpawn < spawnGap) return;
        lastSpawn = now;

        const el = document.createElement("div");
        el.className = "cursor-trail";
        el.style.left = `${e.clientX}px`;
        el.style.top = `${e.clientY}px`;

        const img = document.createElement("img");
        img.src = trailImages[trailIndex % trailImages.length];
        trailIndex++;

        el.appendChild(img);
        document.body.appendChild(el);

        // fuerza el reflow para que la transición de entrada se aplique
        requestAnimationFrame(() => el.classList.add("show"));

        setTimeout(() => {
            el.classList.remove("show");
            el.classList.add("hide");
            setTimeout(() => el.remove(), 260);
        }, lifeTime);
    });
}

/*=========================================================
SOBRE MÍ — CAPA QUE SUBE CON EL SCROLL
=========================================================*/

const aboutStage = document.querySelector(".about-stage");
const aboutOverlay = document.querySelector(".about-overlay");
const aboutImage = document.querySelector(".about-background img");

if (aboutStage && aboutOverlay) {

    function updateAbout() {

        const rect = aboutStage.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        /*
        Calculamos cuánto hemos avanzado
        dentro de la sección.
        */

        const totalScroll = aboutStage.offsetHeight - viewportHeight;

        const currentScroll = -rect.top;

        let progress = currentScroll / totalScroll;

        /*
        Limitamos el valor entre 0 y 1
        */

        progress = Math.max(0, Math.min(1, progress));


        /*
        La capa empieza abajo
        y termina completamente arriba.
        */

        const translateY = 100 - (progress * 100);

        aboutOverlay.style.transform =
            `translateY(${translateY}%)`;


        /*
        Mientras aparece la capa,
        la imagen se va desenfocando.
        */

        if (aboutImage) {

            const blur = progress * 8;

            const scale = 1 + (progress * 0.04);

            aboutImage.style.filter =
                `blur(${blur}px)`;

            aboutImage.style.transform =
                `scale(${scale})`;
        }

    }


    window.addEventListener(
        "scroll",
        updateAbout,
        { passive:true }
    );

    window.addEventListener(
        "resize",
        updateAbout
    );

    updateAbout();
}

/*=========================
APARICIÓN DE CADA TRABAJO FLOTANTE
=========================*/

const floatItems = document.querySelectorAll(".float-item");

floatItems.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(40px)";
    el.style.transition = "opacity .8s ease, transform .8s ease";
});

const floatObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                floatObserver.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.2 }
);

floatItems.forEach((el) => floatObserver.observe(el));

/*=========================================================
TODOS LOS PROYECTOS — imagen flotante en hover sobre la tabla
=========================================================*/
 
const workRows = document.querySelectorAll(".work-table tbody tr");
const hoverImage = document.getElementById("hoverImage");
const hoverImageMedia = hoverImage?.querySelector("img, video");
 
if (workRows.length && hoverImage && hoverImageMedia) {
 
    workRows.forEach((row) => {
 
        row.addEventListener("mouseenter", () => {
            const src = row.dataset.image;
            if (src && hoverImageMedia.getAttribute("src") !== src) {
                hoverImageMedia.setAttribute("src", src);
            }
            hoverImage.classList.add("show");
        });
 
        row.addEventListener("mouseleave", () => {
            hoverImage.classList.remove("show");
        });
 
        row.addEventListener("click", () => {
            const href = row.dataset.href;
            if (href) window.location.href = href;
        });
 
    });
}
 
/*=========================================================
TRABAJOS — MURO 3D: el scroll vertical mueve la fila en horizontal
(solo en escritorio; en móvil el scroll horizontal es táctil nativo)
=========================================================*/
 
const workswallStage = document.querySelector(".workswall-stage");
const workswallTrack = document.querySelector(".workswall-track");
const workswallProgressFill = document.querySelector(".workswall-progress-fill");
const isDesktopWall = window.matchMedia("(min-width: 901px)").matches;
 
if (workswallStage && workswallTrack && isDesktopWall) {
 
    function updateWorkswall() {
 
        const rect = workswallStage.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
 
        const totalScroll = workswallStage.offsetHeight - viewportHeight;
        const currentScroll = -rect.top;
 
        let progress = totalScroll > 0 ? currentScroll / totalScroll : 0;
        progress = Math.max(0, Math.min(1, progress));
 
        // cuánto hay que desplazar la fila para que la última
        // tarjeta llegue justo al borde derecho de la pantalla
        const maxTranslate = Math.max(
            workswallTrack.scrollWidth - window.innerWidth,
            0
        );
 
        const translateX = -progress * maxTranslate;
 
        workswallTrack.style.transform = `translateX(${translateX}px)`;
 
        if (workswallProgressFill) {
            workswallProgressFill.style.width = `${progress * 100}%`;
        }
    }
 
    window.addEventListener("scroll", updateWorkswall, { passive:true });
    window.addEventListener("resize", updateWorkswall);
    window.addEventListener("load", updateWorkswall);
    updateWorkswall();
}
 
/*=========================================================
CONTACTO — INTERACCIÓN
=========================================================*/

const contactInteraction =
    document.getElementById("contactInteraction");

if (contactInteraction) {

    contactInteraction.addEventListener("click", () => {

        contactInteraction.classList.toggle("touch-active");

    });

}