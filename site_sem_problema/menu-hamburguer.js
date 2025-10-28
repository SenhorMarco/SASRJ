const hamMenuButton = document.querySelector('.menu-ham-button');
const hamMenuIcon = document.querySelector('.ham-menu');
const offScreenMenu = document.querySelector('.off-screen-menu');

if (hamMenuButton && hamMenuIcon && offScreenMenu) {
    hamMenuButton.addEventListener('click', () => {
        hamMenuIcon.classList.toggle('active');
        offScreenMenu.classList.toggle('active');
        // Optional: Prevent body scroll when menu is open
        document.body.style.overflow = offScreenMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Optional: Close menu if user clicks outside of it
    document.addEventListener('click', (event) => {
        const isClickInsideMenu = offScreenMenu.contains(event.target);
        const isClickOnButton = hamMenuButton.contains(event.target);

        if (!isClickInsideMenu && !isClickOnButton && offScreenMenu.classList.contains('active')) {
             hamMenuIcon.classList.remove('active');
             offScreenMenu.classList.remove('active');
             document.body.style.overflow = '';
        }
    });

} else {
    console.error("Elementos do menu hamburguer não encontrados! Verifique as classes no HTML e JS."); // Mensagem de erro mais clara
}