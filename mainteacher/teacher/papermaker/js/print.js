const button = document.getElementById("print");

button.addEventListener('click', function() {
    button.style.display='none';
    document.querySelectorAll('.question-dropdown').forEach(dropdown => {
        dropdown.style.display = 'none';
    });

    window.print();
});
