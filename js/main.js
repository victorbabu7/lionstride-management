
const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.linknav');

burger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});


const links = document.querySelectorAll('a[href^="#"]');
links.forEach(link => {
    link.addEventListener('click', (click) => {
        click.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));

        target.scrollIntoView({
            behavior: 'smooth'});
            
        navLinks.classList.remove('active');
    });
});
const modalData = {
    athlete: {
        title: 'Athlete Management',
        text: 'Our Athlete Management service provides complete career support for professional athletes.'
    },
    scouting: {
        title: 'Scouting',
        text: 'Our Scouting service identifies and develops the next generation of sporting talent. We have a network of scouts across the world who identify promising young athletes. '
    },
    race: {
        title: 'Race Placement',
        text: 'Our Race Placement service strategically places athletes in top competitions worldwide. .'
    }
}
function openModal(service) {
    const modal = document.getElementById('modal');
    const title = document.getElementById('modal-title');
    const text = document.getElementById('modal-text');
    title.textContent = modalData[service].title;
    text.textContent = modalData[service].text;
    modal.classList.add('active');
}
function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('active');
}
window.addEventListener('click', (e) => {
    const modal = document.getElementById('modal');
    if (e.target === modal) {
    closeModal();
    }
});