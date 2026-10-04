// tech text animation
(() => {
    const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
    const approach = (current, target, dt, seconds) => current + (target - current) * (1 - Math.exp(-dt / seconds));

    const hexToRgb = (hex) => {
        let value = String(hex || '').replace('#', '');
        if (value.length === 3) value = value.replace(/./g, c => c + c);
        const number = parseInt(value.slice(0,6), 16);
        return Number.isNaN(number) ? [255,255,255] : [(number >> 16) & 255, (number >> 8) & 255, number & 255];
    };

    const rgba = (hex, alpha) => {
        const [r, g, b] = hexToRgb(hex);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const TechText = (selector, options = {}) => {
        const container = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (!container) return;

        const settings = {
            text: 'Welcome to NOVA Club',
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontWeight: 600,
            fontSize: 100,
            color: '#000000',
            accentColor: '#000000',
            reach: 180,
            draggable: true,
            sweep: false,
            speed: 1,
            labels: true,
            specks: 14,
            ...options
        };

        const canvas = document.createElement('canvas');
        canvas.className = 'tech-text-canvas';
        container.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        const scratch = document.createElement('canvas');
        const scratchCtx = scratch.getContext('2d');

        let width, height = 1;
        let dpr = 1;
        let raf = 0;
        let last = performance.now();
        let clock = 0;
        let pulse = 0;
        let visible = true;
        let alive = true;
        let layoutKey = '';
        let view = null;
        let glyphs = [];
        let dragging = -1;
        let frameIndex = -1;
        let frameAlpha = 0;
        let presence = 0;
        let placed = false;

        const pointer = {x: 0, y: 0, inside: false};
        const lens = {x: 0, y: 0};
        const grab = {x: 0, y: 0};
        const frame = {x1: 0, y1: 0, x2: 0, y2: 0};

        const font = size => `${settings.fontWeight} ${size}px ${settings.fontFamily}`;
        const setFont = (target, size) => {
            target.font = font(size);
            target.textAlign = 'left';
            target.textBaseline = 'alphabetic';
        };

        const makeSprite = (glyph, outline) => {
            const pad = settings.strokeWidth || 2;
            const left = glyph.box.x1 - pad - 3;
            const top = glyph.box.y1 - pad - 3;
            const w = glyph.box.x2 - glyph.box.x1 + (pad+3) * 2;
            const h = glyph.box.y2 - glyph.box.y1 + (pad+3) * 2;

            const image = document.createElement('canvas');
            image.width = Math.max(1, Math.ceil(w * dpr));
            image.height = Math.max(1, Math.ceil(h * dpr));

            const c = image.getContext('2d');
            c.setTransform(dpr, 0, 0, dpr, -left * dpr, -top * dpr);
            setFont(c, view.size);

            if(outline){
                c.strokeStyle = settings.color;
                c.lineWidth = 1.5;
                c.setLineDash([4,2]);
                c.strokeText(glyph.char, glyph.x, view.baseline);
                c.setLineDash([]);
                c.globalCompositeOperation = 'destination-out';
                c.fillText(glyph.char, glyph.x, view.baseline);
                c.globalCompositeOperation = 'source-over';
            } else{
                c.fillStyle = settings.color;
                c.fillText(glyph.char, glyph.x, view.baseline);
            }

            return{image, left, top};
        };

        const ensureLayout = () => {
            const key = `${settings.text}|${width}|${height}|${dpr}|${settings.fontSize}`;
            if (key === layoutKey && view) return;
            layoutKey = key;

            setFont(scratchCtx, settings.fontSize);
            let metrics = scratchCtx.measureText(settings.text);
            
            const fit = Math.min(1, (width * 0.9) / Math.max(metrics.width, 1), (height * 0.68) / Math.max(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent, 1));
            const size = settings.fontSize * fit;
            setFont(scratchCtx, size);
            metrics = scratchCtx.measureText(settings.text);

            const textWidth = metrics.width;
            const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
            const x = (width - textWidth) / 2;
            const baseline = (height - textHeight) / 2 + metrics.actualBoundingBoxAscent;

            view = {size, baseline, left: x, right: x + textWidth, top: baseline - metrics.actualBoundingBoxAscent, bottom: baseline + metrics.actualBoundingBoxDescent};

            glyphs = [];
            let prefix = '';

            for (const char of Array.from(settings.text)){
                prefix += char;
                if (!char.trim()) continue;

                const own = scratchCtx.measureText(char);
                const gx = x + scratchCtx.measureText(prefix).width - own.width;
                const glyph = {
                    char,
                    x: gx,
                    box: {
                        x1: gx - own.actualBoundingBoxLeft,
                        y1: baseline - own.actualBoundingBoxAscent,
                        x2: gx + own.actualBoundingBoxRight,
                        y2: baseline + own.actualBoundingBoxDescent
                    },
                    offset: {x:0, y:0},
                    velocity: {x:0, y:0},
                    outline: 0
                };

                glyph.fill = makeSprite(glyph, false);
                glyph.dashes = makeSprite(glyph, true);
                glyphs.push(glyph);
            }
            frameIndex = -1;
        };

        const blit = (art, dx = 0, dy = 0) => {
            ctx.drawImage(
                art.image,
                Math.round((art.left + dx) * dpr),
                Math.round((art.top + dy) * dpr)
            );
        };

        const glyphAt = (x, y) => {
            let best = -1;
            let bestDistance = Infinity;

            glyphs.forEach((glyph, index) => {
                const x1 = glyph.box.x1 + glyph.offset.x - 8;
                const y1 = glyph.box.y1 + glyph.offset.y - 8;
                const x2 = glyph.box.x2 + glyph.offset.x + 8;
                const y2 = glyph.box.y2 + glyph.offset.y + 8;
                
                if(x < x1 || x > x2 || y < y1 || y > y2){
                    return;
                }

                const centerX = (x1 + x2) / 2;
                const centerY = (y1 + y2) / 2;
                const distance = Math.hypot(x - centerX, y - centerY);

                if (distance < bestDistance){
                    bestDistance = distance;
                    best = index;
                }
            });

            return best;
        };

        const drawFrame = (index, alpha) => {
            if (index < 0 || alpha < 0.01) return;
            const glyph = glyphs[index];

            ctx.save();
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const padding = 4;
            const x1 = glyph.box.x1 + glyph.offset.x - padding;
            const y1 = glyph.box.y1 + glyph.offset.y - padding;
            const x2 = glyph.box.x2 + glyph.offset.x + padding;
            const y2 = glyph.box.y2 + glyph.offset.y + padding;

            const moved = Math.hypot(glyph.offset.x, glyph.offset.y);
            if (moved > 1){
                const centerX = (glyph.box.x1 + glyph.box.x2) / 2;
                const centerY = (glyph.box.y1 + glyph.box.y2) / 2;

                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(centerX + glyph.offset.x, centerY + glyph.offset.y);
                ctx.setLineDash([3,4]);
                ctx.lineWidth = 1;
                ctx.strokeStyle = rgba(settings.accentColor, 0.45 * alpha);
                ctx.stroke();
                ctx.setLineDash([]);
            }

            ctx.lineWidth = 1;
            ctx.strokeStyle = rgba(settings.accentColor, 0.55 * alpha);
            ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
            ctx.strokeStyle = rgba(settings.accentColor, 0.9 * alpha);
            ctx.fillStyle = rgba(settings.accentColor, 0.9 * alpha);

            [[x1, y1], [x2, y1], [x2, y2], [x1, y2]].forEach(([x, y]) => {
                ctx.fillRect(Math.round(x) - 2, Math.round(y) - 2, 5, 5);
            });

            if (settings.labels){
                const letterWidth = Math.round(glyph.box.x2 - glyph.box.x1);
                const letterHeight = Math.round(glyph.box.y2 - glyph.box.y1);
                const label = `${glyph.char} ${letterWidth} x ${letterHeight}`;

                ctx.font = `10px ui-monospace, monospace`;
                ctx.textAlign = "left";
                ctx.textBaseline = "alphabetic";

                const labelX = Math.max(4, x1);
                const labelY = Math.max(16, y1 - 8);

                ctx.fillStyle = rgba(settings.accentColor, 0.8 * alpha);
                ctx.fillText(label, labelX, labelY);
            }

            ctx.restore();
        };

        const tick = now => {
            raf = 0;
            if(!alive || !visible) return;

            const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
            last = now;
            ensureLayout();

            const sweeping = settings.sweep && !pointer.inside && dragging < 0;
            if(sweeping) clock += dt * settings.speed;
            pulse += dt;

            const targetX = pointer.inside
                ? pointer.x
                : view.left + (view.right - view.left) * (0.5 - 0.5 * Math.cos(clock * 0.45));
            const targetY = pointer.inside
                ? pointer.y
                : view.top + (view.bottom - view.top) * (0.45 + 0.1 * Math.sin(clock * 0.8));

            const active = pointer.inside || sweeping || dragging >= 0;
            if(active && !placed){
                lens.x = targetX;
                lens.y = targetY;
            }
            if(active){
                lens.x = approach(lens.x, targetX, dt, pointer.inside ? 0.05 : 0.22);
                lens.y = approach(lens.y, targetY, dt, pointer.inside ? 0.05 : 0.22);
            }

            placed = active;
            presence = approach(presence, active ? 1 : 0, dt, 0.16);

            glyphs.forEach((glyph, i) => {
                if (i === dragging){
                    glyph.offset.x = approach(glyph.offset.x, pointer.x - grab.x, dt, 0.03);
                    glyph.offset.y = approach(glyph.offset.y, pointer.y - grab.y, dt, 0.03);
                    glyph.velocity.x = glyph.velocity.y = 0;
                    return;
                }

                glyph.velocity.x += (-320 * glyph.offset.x - 22 * glyph.velocity.x) * dt;
                glyph.velocity.y += (-320 * glyph.offset.y - 22 * glyph.velocity.y) * dt;
                glyph.offset.x += glyph.velocity.x * dt;
                glyph.offset.y += glyph.velocity.y * dt;
            });

            const focus = dragging >= 0 ? dragging : active ? glyphAt(lens.x, lens.y) : -1;
            if (focus >= 0){
                frameIndex = focus;
                frameAlpha = approach(frameAlpha, 1, dt, 0.1);
            } else{
                frameAlpha = approach(frameAlpha, 0, dt, 0.1);
            }

            glyphs.forEach((glyph, i) => {
                const target = i === focus && dragging < 0 ? 1 : 0;
                glyph.outline = approach(glyph.outline, target, dt, 0.09);
            });

            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            glyphs.forEach(glyph => {
                const moved = Math.hypot(glyph.offset.x, glyph.offset.y);
                if (moved > 1){
                    ctx.globalAlpha = Math.min(1, moved/24) * 0.55;
                    blit(glyph.dashes);
                    ctx.globalAlpha = 1;
                }
            });

            glyphs.forEach(glyph => {
                ctx.globalAlpha = 1 - glyph.outline;
                blit(glyph.fill, glyph.offset.x, glyph.offset.y);
                
                ctx.globalAlpha = glyph.outline;
                blit(glyph.dashes, glyph.offset.x, glyph.offset.y);

                ctx.globalAlpha = 1;
            });

            drawFrame(frameIndex, frameAlpha);
            raf = requestAnimationFrame(tick);
        };

        const wake = () => {
            if (!raf && alive && visible){
                last = performance.now();
                raf = requestAnimationFrame(tick);
            }
        };

        const resize = () => {
            width = Math.max(1, container.clientWidth);
            height = Math.max(1, container.clientHeight);
            dpr = Math.min(window.devicePixelRatio || 1, 2);

            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            canvas.style.width = `${width}px`
            canvas.style.height = `${height}px`

            layoutKey = '';
            wake();
        };

        const locate = e => {
            const rect = container.getBoundingClientRect();
            pointer.x = e.clientX - rect.left;
            pointer.y = e.clientY - rect.top;
        }

        const move = e => {
            locate(e);
            pointer.inside = true;
            wake();
        };

        const leave = () => {
            if(dragging<0){
                pointer.inside = false;
                wake();
            }
        };

        const down = e => {
            locate(e);
            pointer.inside = true;

            if(settings.draggable && (e.pointerType !== 'mouse' || e.button === 0)){
                const index = glyphAt(pointer.x, pointer.y);

                if(index >= 0){
                    dragging = index;
                    grab.x = pointer.x - glyphs[index].offset.x;
                    grab.y = pointer.y - glyphs[index].offset.y;
                    container.setPointerCapture(e.pointerId);
                }
            }

            wake();
        };

        const up = e => {
            if (dragging >= 0){
                dragging = -1;
                if(container.hasPointerCapture(e.pointerId)){
                    container.releasePointerCapture(e.pointerId);
                }
            }

            wake();
        };

        container.addEventListener('pointermove', move, {passive: true});
        container.addEventListener('pointerenter', move, {passive: true});
        container.addEventListener('pointerleave', leave, {passive: true});
        container.addEventListener('pointerdown', down, {passive: true});
        container.addEventListener('pointerup', up, {passive: true});
        container.addEventListener('pointercancel', up, {passive: true});

        new ResizeObserver(resize).observe(container);
        resize();
        wake();

        return () => {
            alive = false;
            cancelAnimationFrame(raf);
            container.replaceChildren();
        };
    };

    window.TechText = TechText;
})();

document.addEventListener('DOMContentLoaded', () => {
    // navbar
    const nav = document.getElementById('nav');

    function checkScroll () {
        if(window.scrollY>40){
            nav.classList.add("scrolled");
        } else{
            nav.classList.remove("scrolled");
        }
    }

    window.addEventListener('scroll', checkScroll);
    checkScroll();

    // counter in about section
    const counters = document.querySelectorAll(".statnum");

    const counting = (counter) => {
        const target = +counter.getAttribute("data-target");
        const countstart = +counter.innerText;
        const increment = Math.max(1, target / 100);

        if (countstart < target){
            counter.innerText = Math.ceil(countstart + increment);
            setTimeout(() => counting(counter), 100);
        } else{
            counter.innerText = target;
        }
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting){
                counting(entry.target);
                observer.unobserve(entry.target);
            }
        })
    }, {threshold: 0.5});

    counters.forEach(counter => observer.observe(counter));

    // sponsor card popup
    const sponsorCard = document.querySelector(".sponsor-card");
    const sponsorPopup = document.getElementById("sponsor-popup");
    const closePopup = document.getElementById("closepopup");

    sponsorCard.addEventListener("click", () => {
        sponsorPopup.classList.add("active");
    });

    closePopup.addEventListener("click", () => {
        sponsorPopup.classList.remove("active");
    });

    sponsorPopup.addEventListener("click", (event) => {
        if (event.target === sponsorPopup) {
            sponsorPopup.classList.remove("active");
        }
    });

    // member card flipping
    const memberCards = document.querySelectorAll(".membercard");
    
    memberCards.forEach(card => {
        card.addEventListener("click", () => {
            card.classList.toggle("flipped");
        })
    });

    // hero title animation
    TechText('#herotitle h1', {
        text: 'Welcome to NOVA Club',
        fontSize: 100,
        color: '#000000',
        draggable: true,
        accentColor: '#000000',
        sweep: false,
        labels: true,
        specks: 15
    });
});