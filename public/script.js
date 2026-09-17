document.addEventListener('DOMContentLoaded', () => {
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
})