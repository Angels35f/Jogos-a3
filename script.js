window.addEventListener('load', () => {
    randomizeBubblePositions();

    interact('.dropzone').dropzone({
        accept: '.draggable',
        overlap: 0.5,
        ondropactivate: (event) => event.target.classList.add('can-drop'),
        ondropdeactivate: (event) => event.target.classList.remove('can-drop'),
        ondrop: (event) => {
            const draggableElement = event.relatedTarget;
            const dropzoneElement = event.target;
            const bubbleId = draggableElement.dataset.bubbleId;
            const targetId = dropzoneElement.dataset.targetId;
            const feedbackMessage = document.getElementById('feedback-message');

            if (bubbleId === targetId) {
                draggableElement.classList.add('correct');
                draggableElement.style.position = 'absolute';
                draggableElement.style.transform = '';
                draggableElement.style.top = '50%';
                draggableElement.style.left = '50%';
                draggableElement.removeAttribute('data-x');
                draggableElement.removeAttribute('data-y');
                interact(draggableElement).unset();
                feedbackMessage.textContent = 'Correto!';
                feedbackMessage.style.color = 'green';
                dropzoneElement.appendChild(draggableElement);
            } else {
                const originalX = parseFloat(draggableElement.getAttribute('data-start-x')) || 0;
                const originalY = parseFloat(draggableElement.getAttribute('data-start-y')) || 0;
                draggableElement.style.transform = `translate(${originalX}px, ${originalY}px)`;
                draggableElement.setAttribute('data-x', originalX);
                draggableElement.setAttribute('data-y', originalY);
                feedbackMessage.textContent = 'Tente novamente!';
                feedbackMessage.style.color = 'red';
            }
        }
    });

    interact('.draggable').draggable({
        inertia: true,
        modifiers: [
            interact.modifiers.restrictRect({
                restriction: 'parent',
                endOnly: true
            })
        ],
        autoScroll: true,
        listeners: { move: dragMoveListener }
    });

    function dragMoveListener(event) {
        const target = event.target;
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
        target.style.transform = `translate(${x}px, ${y}px)`;
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
    }

    function randomizeBubblePositions() {
        const bubbles = document.querySelectorAll('.draggable');
        const gameWorld = document.getElementById('game-world');
        const worldRect = gameWorld.getBoundingClientRect();

        bubbles.forEach(bubble => {
            const maxLeft = worldRect.width - bubble.offsetWidth - 20;
            const maxTop = worldRect.height - bubble.offsetHeight - 20;
            const randomLeft = Math.floor(Math.random() * maxLeft) + 10;
            const randomTop = Math.floor(Math.random() * maxTop) + 10;
            bubble.style.left = `${randomLeft}px`;
            bubble.style.top = `${randomTop}px`;
            bubble.setAttribute('data-start-x', '0');
            bubble.setAttribute('data-start-y', '0');
            bubble.setAttribute('data-x', '0');
            bubble.setAttribute('data-y', '0');
        });
    }
});