window.addEventListener('load', () => {
    const feedbackMessage = document.getElementById('feedback-message');
    const bubbles = document.querySelectorAll('.draggable');
    bubbles.forEach(b => b.dataset.originParent = b.parentElement.id || '');

    interact('.dropzone').dropzone({
        accept: '.draggable',
        overlap: 0.4,
        ondropactivate: (event) => event.target.classList.add('can-drop'),
        ondropdeactivate: (event) => event.target.classList.remove('can-drop'),
        ondrop: (event) => {
            const draggable = event.relatedTarget;
            const dropzone = event.target;
            const bubbleId = String(draggable.dataset.bubbleId);
            const targetId = String(dropzone.dataset.targetId);

            if (bubbleId === targetId) {
                const panelRect = dropzone.getBoundingClientRect();
                const clientX = event.dragEvent.clientX;
                const clientY = event.dragEvent.clientY;
                let left = clientX - panelRect.left - (draggable.offsetWidth / 2);
                let top = clientY - panelRect.top - (draggable.offsetHeight / 2);
                const maxLeft = Math.max(0, dropzone.clientWidth - draggable.offsetWidth);
                const maxTop = Math.max(0, dropzone.clientHeight - draggable.offsetHeight);
                left = Math.max(0, Math.min(left, maxLeft));
                top = Math.max(0, Math.min(top, maxTop));

                draggable.classList.add('correct', 'placed');
                draggable.style.position = 'absolute';
                draggable.style.left = `${left}px`;
                draggable.style.top = `${top}px`;
                draggable.style.transform = '';
                draggable.removeAttribute('data-x');
                draggable.removeAttribute('data-y');
                draggable.removeAttribute('data-start-x');
                draggable.removeAttribute('data-start-y');
                dropzone.appendChild(draggable);
                interact(draggable).unset();
                feedbackMessage.textContent = 'Correto!';
                feedbackMessage.style.color = 'green';
            } else {
                const originId = draggable.dataset.originParent;
                const origin = originId ? document.getElementById(originId) : document.getElementById('palette');
                draggable.style.transform = '';
                draggable.style.left = '';
                draggable.style.top = '';
                draggable.style.position = '';
                draggable.classList.remove('placed');
                origin.appendChild(draggable);
                feedbackMessage.textContent = 'Tente novamente!';
                feedbackMessage.style.color = 'red';
            }
        }
    });

    const worldEl = document.getElementById('game-world');

    interact('.draggable').draggable({
        inertia: true,
        autoScroll: true,
        listeners: {
            start(event) {
                const t = event.target;
                t.classList.add('is-dragging'); // Añade clase mientras se arrastra
                t.dataset.draggingFrom = t.parentElement.id || '';
            },
            move: dragMoveListener,
            end(event) {
                event.target.classList.remove('is-dragging'); // Remueve la clase
            }
        }
    });

    function dragMoveListener(event) {
        const target = event.target;
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
        target.style.transform = `translate(${x}px, ${y}px)`;
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
    }
});
interact('.draggable').draggable({
        inertia: true,
        autoScroll: true,
        listeners: {
            start(event) {
                const t = event.target;
                t.classList.add('is-dragging');
                t.dataset.draggingFrom = t.parentElement.id || '';

                // --- INICIO DE LA SOLUCIÓN ---
                // 1. Obtener la posición actual del bocadillo en la pantalla
                const rect = t.getBoundingClientRect();
                const world = document.getElementById('game-world');
                const worldRect = world.getBoundingClientRect();

                // 2. Mover el bocadillo al 'game-world' para escapar del 'overflow' del sidebar
                world.appendChild(t);

                // 3. Establecer su posición absoluta relativa al 'game-world'
                //    (posición del bocadillo - posición del 'game-world')
                const newLeft = rect.left - worldRect.left;
                const newTop = rect.top - worldRect.top;

                t.style.position = 'absolute'; // Asegurarse de que sea 'absolute'
                t.style.left = `${newLeft}px`;
                t.style.top = `${newTop}px`;

                // 4. Reiniciar el transform y los datos de 'interact.js'
                //    para que el 'dragMoveListener' comience desde (0,0) en la nueva posición
                t.style.transform = ''; 
                t.setAttribute('data-x', 0);
                t.setAttribute('data-y', 0);
                // --- FIN DE LA SOLUCIÓN ---
            },

            move: dragMoveListener, // Tu función 'dragMoveListener' sigue igual

            end(event) {
                event.target.classList.remove('is-dragging'); // Esto ya lo tenías y está bien
            }
        }
    });