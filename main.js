/* Se usa en varios sitios del archivo, por eso va aquí arriba */
const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
const aboutImages = document.querySelectorAll(".about-background img");
const aboutBio = document.querySelector(".about-bio");
const aboutDetails = document.querySelector(".about-details");

let bioWords = [];
let lastBioActiveCount = -1;

if (aboutBio) {

    function wrapBioWords(el) {

        function processNode(node) {

            if (node.nodeType === Node.TEXT_NODE) {

                const parts = node.textContent.split(/(\s+)/);
                const frag = document.createDocumentFragment();

                parts.forEach((part) => {

                    if (part.trim() === "") {
                        frag.appendChild(document.createTextNode(part));
                        return;
                    }

                    const span = document.createElement("span");
                    span.className = "bio-word";
                    span.textContent = part;
                    bioWords.push(span);

                    frag.appendChild(span);

                });

                node.replaceWith(frag);

            } else if (node.nodeType === Node.ELEMENT_NODE) {

                Array.from(node.childNodes).forEach(processNode);

            }

        }

        Array.from(el.childNodes).forEach(processNode);

    }

    if (prefersReducedMotion) {

        aboutBio.style.color = "var(--fg)";

    } else {

        wrapBioWords(aboutBio);

    }

}

/*=========================================================
CHIPS COLGANDO — físicas de péndulo amortiguado
Cada chip cuelga de un hilo y cae + oscila con inercia real
al mostrarse, y se esconden si se vuelve a subir en el scroll.
=========================================================*/

const skillChips = Array.from(
    document.querySelectorAll(".about-detail span")
);

let showChips = () => {};
let hideChips = () => {};

if (skillChips.length && aboutDetails) {

    if (prefersReducedMotion) {

        showChips = () => {
            aboutDetails.classList.add("is-visible");
        };

        hideChips = () => {
            aboutDetails.classList.remove("is-visible");
        };

    } else {

        /* Una sola fila, de izquierda a derecha, con la
           cuerda alternando corta/larga (como banderines) */

        const n = skillChips.length;
        const leftMargin = 8;
        const rightMargin = 92;

        const ropeTopPercent = 14;
        const shortDrop = 4;
        const longDrop = 15;

        const chipStates = skillChips.map((el, i) => {

            const leftPercent =
                n > 1
                    ? leftMargin + (rightMargin - leftMargin) * (i / (n - 1))
                    : (leftMargin + rightMargin) / 2;

            const isShort = i % 2 === 0;
            const topPercent = ropeTopPercent + (isShort ? shortDrop : longDrop);
            const threadLenRest = isShort ? 26 : 90;

            const dropStartY = -(600 + Math.random() * 400);

            el.style.left = `${leftPercent.toFixed(1)}%`;
            el.style.top = `${topPercent.toFixed(1)}%`;
            el.style.fontSize = `${(24 + Math.random() * 10).toFixed(0)}px`;

            return {
                el,
                dropStartY,
                threadLenRest,
                y: dropStartY,
                velocityY: 0,
                x: 0,
                velocityX: 0,
                angle: (Math.random() - 0.5) * 8,
                angularVelocity: 0,
                restAngle: (Math.random() - 0.5) * 10,
                restX: 0,
                released: false,
                index: i
            };

        });

        let chipsVisible = false;
        let chipScrollVelocity = 0;
        let lastChipScrollY = window.scrollY;

        showChips = () => {

            if (chipsVisible) return;
            chipsVisible = true;

            aboutDetails.classList.add("is-visible");

            chipStates.forEach((state) => {

                setTimeout(() => {

                    state.y = state.dropStartY;
                    state.velocityY = 0;
                    state.x = 0;
                    state.velocityX = 0;
                    state.angularVelocity = (Math.random() - 0.5) * 120;
                    state.released = true;

                }, state.index * 110);

            });

        };

        hideChips = () => {

            if (!chipsVisible) return;
            chipsVisible = false;

            aboutDetails.classList.remove("is-visible");

            chipStates.forEach((state) => {
                state.released = false;
            });

        };

        function chipsPhysicsLoop() {

            const currentScrollY = window.scrollY;
            const rawVel = currentScrollY - lastChipScrollY;
            lastChipScrollY = currentScrollY;
            chipScrollVelocity += (rawVel - chipScrollVelocity) * 0.15;

            const scrollTorque =
                Math.max(-30, Math.min(30, chipScrollVelocity * 0.8));

            chipStates.forEach((state) => {

                if (!state.released) return;

                /* caída vertical, como si tirase de ella la gravedad
                   y el hilo la frenase de golpe */
                const ySpring = 0.02;
                const yDamping = 0.82;

                state.velocityY += -state.y * ySpring;
                state.velocityY *= yDamping;
                state.y += state.velocityY;

                /* deriva lateral hasta su posición de reposo */
                const xSpring = 0.02;
                const xDamping = 0.85;

                state.velocityX += (state.restX - state.x) * xSpring;
                state.velocityX *= xDamping;
                state.x += state.velocityX;

                /* balanceo, como un cartel colgado, hasta su
                   propio ángulo de reposo (no todos a cero) */
                const angleSpring = 0.012;
                const angleDamping = 0.92;

                state.angularVelocity +=
                    ((state.restAngle - state.angle) * angleSpring) +
                    (scrollTorque * 0.01);
                state.angularVelocity *= angleDamping;
                state.angle += state.angularVelocity;

                state.el.style.transform =
                    `translate(${state.x.toFixed(1)}px, ${state.y.toFixed(1)}px) rotate(${state.angle.toFixed(2)}deg)`;

                /* el hilo se estira mientras cae, y se asienta
                   en su largo de reposo (corto o largo) al terminar */
                const fallExtra = Math.max(0, -state.y) * 0.6;
                const threadLen = state.threadLenRest + fallExtra;
                state.el.style.setProperty("--thread-len", `${threadLen.toFixed(1)}px`);

            });

            requestAnimationFrame(chipsPhysicsLoop);

        }

        requestAnimationFrame(chipsPhysicsLoop);

    }

}

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
        Separamos el recorrido en dos tramos:
        - overlayProgress: sube la capa (primer 40% del scroll)
        - readProgress: colorea el texto y saca los chips,
          durante el 60% restante, cuando ya se puede leer.
        */

        const overlayProgress = Math.max(0, Math.min(1, progress / 0.4));
        const readProgress = Math.max(0, Math.min(1, (progress - 0.4) / 0.6));


        /*
        La capa empieza abajo
        y termina completamente arriba.
        */

        const translateY = 100 - (overlayProgress * 100);

        aboutOverlay.style.transform =
            `translateY(${translateY}%)`;


        /*
        Mientras aparece la capa,
        la imagen se va desenfocando.
        */

        if (aboutImages.length) {

            const blur = overlayProgress * 8;

            const scale = 1 + (overlayProgress * 0.04);

            aboutImages.forEach((img) => {

                img.style.filter =
                    `blur(${blur}px)`;

                img.style.transform =
                    `scale(${scale})`;

            });

        }


        /*
        Las palabras del bio se van coloreando
        ya con la capa colocada, mientras se lee.
        */

        if (bioWords.length) {

            const activeCount = Math.round(readProgress * bioWords.length);

            if (activeCount !== lastBioActiveCount) {

                bioWords.forEach((word, i) => {
                    word.classList.toggle("is-active", i < activeCount);
                });

                lastBioActiveCount = activeCount;

            }

        }


        /*
        Los chips de Servicios/Herramientas se sueltan
        cerca del final de ese mismo tramo de lectura.
        */

        if (readProgress > 0.7) {
            showChips();
        } else {
            hideChips();
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

/*=========================================================
TIPOGRAFÍA CINÉTICA
1) .reveal-words: divide el texto en palabras y las revela
   una a una (con retardo) al entrar en pantalla.
2) .scroll-reactive: el bloque se inclina/estira según la
   velocidad del scroll, y vuelve solo a su sitio al parar.
Respeta "prefers-reduced-motion" (variable declarada arriba
del todo del archivo).
=========================================================*/

/* --- 1) Revelado de palabras --- */

function splitIntoWords(el) {

    let wordIndex = 0;

    function processNode(node) {

        if (node.nodeType === Node.TEXT_NODE) {

            const parts = node.textContent.split(/(\s+)/);
            const frag = document.createDocumentFragment();

            parts.forEach((part) => {

                if (part.trim() === "") {
                    frag.appendChild(document.createTextNode(part));
                    return;
                }

                const outer = document.createElement("span");
                outer.className = "word";

                const inner = document.createElement("span");
                inner.className = "word-inner";
                inner.style.setProperty("--i", wordIndex++);
                inner.textContent = part;

                outer.appendChild(inner);
                frag.appendChild(outer);

            });

            node.replaceWith(frag);

        } else if (node.nodeType === Node.ELEMENT_NODE) {

            Array.from(node.childNodes).forEach(processNode);

        }

    }

    Array.from(el.childNodes).forEach(processNode);

}

const revealWordsEls = document.querySelectorAll(".reveal-words");

if (revealWordsEls.length) {

    revealWordsEls.forEach(splitIntoWords);

    if (prefersReducedMotion) {

        revealWordsEls.forEach((el) => el.classList.add("is-visible"));

    } else {

        const wordObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        wordObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.4 }
        );

        revealWordsEls.forEach((el) => wordObserver.observe(el));

    }

}

/*=========================================================
MODO CLARO / OSCURO
El estado inicial ya lo aplica un script en el <head> (para
evitar el parpadeo). Aquí solo gestionamos el clic y guardamos
la preferencia para que se recuerde en las demás páginas.
=========================================================*/

const themeToggle = document.getElementById("themeToggle");

function updateThemeToggleLabel() {

    if (!themeToggle) return;

    const isLight = document.documentElement.getAttribute("data-theme") === "light";

    themeToggle.textContent = isLight ? "☾" : "☀";
    themeToggle.setAttribute(
        "aria-label",
        isLight ? "Cambiar a modo oscuro" : "Cambiar a modo claro"
    );

}

updateThemeToggleLabel();

if (themeToggle) {

    themeToggle.addEventListener("click", () => {

        const isLight = document.documentElement.getAttribute("data-theme") === "light";

        if (isLight) {
            document.documentElement.removeAttribute("data-theme");
            try { localStorage.setItem("laulo-theme", "dark"); } catch (e) {}
        } else {
            document.documentElement.setAttribute("data-theme", "light");
            try { localStorage.setItem("laulo-theme", "light"); } catch (e) {}
        }

        updateThemeToggleLabel();

    });

}