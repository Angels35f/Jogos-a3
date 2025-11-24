window.addEventListener('load', () => {
    const feedbackMessage = document.getElementById('feedback-message'); 
    const worldEl = document.getElementById('game-world'); 
    const paletteList = document.querySelector('.palette-list'); 
    const header = document.querySelector('header'); 
    const appEl = document.querySelector('.app'); 
    const winModal = document.getElementById('win-modal'); 

    let gameIsWon = false; 

    document.querySelectorAll('.draggable').forEach(b => {
        b.dataset.originParent = b.parentElement.id || 'palette';
        makeDraggable(b); 
    });

    function adjustHeaderSpacing() {
        const rect = header.getBoundingClientRect();
        const gap = 12; 
        if (appEl) appEl.style.paddingTop = `${Math.ceil(rect.bottom + gap)}px`;
    }
    window.addEventListener('resize', adjustHeaderSpacing);
    adjustHeaderSpacing();


    function shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function randomizePalettePositions() {
        const items = Array.from(paletteList.querySelectorAll('.speech-bubble'));
        if (!items.length) return;

        const shuffled = shuffleArray(items.slice());
        shuffled.forEach(el => paletteList.appendChild(el));

        shuffled.forEach(el => {
            const maxX = Math.max(0, Math.min(120, paletteList.clientWidth - el.offsetWidth - 8));
            const randX = Math.floor(Math.random() * (maxX + 1)); 
            const randY = Math.floor(Math.random() * 16) - 8; 
            
            el.style.transform = `translate(${randX}px, ${randY}px)`;
            
            el.setAttribute('data-start-x', randX);
            el.setAttribute('data-start-y', randY);
            el.setAttribute('data-x', randX);
            el.setAttribute('data-y', randY);
        });
    }

    randomizePalettePositions();

    function checkWinCondition() {
        const totalBubbles = document.querySelectorAll('.speech-bubble').length;
        const correctBubbles = document.querySelectorAll('.speech-bubble.correct').length;

        if (correctBubbles === totalBubbles && totalBubbles > 0) {
            gameIsWon = true;
            
            setTimeout(() => {
                if(winModal) winModal.classList.remove('hidden'); 
                feedbackMessage.textContent = 'Parabéns! Você completou a história.';
                feedbackMessage.style.color = 'blue';
            }, 500);
        }
    }


    interact('.dropzone').dropzone({
        accept: '.draggable', 
        overlap: 0.4, 
        
        ondropactivate: e => e.target.classList.add('can-drop'),
        ondropdeactivate: e => e.target.classList.remove('can-drop'),
        
        ondrop: event => {
            const draggable = event.relatedTarget; 
            const dropzone = event.target; 
            
            const bubbleId = String(draggable.dataset.bubbleId);
            const targetId = String(dropzone.dataset.targetId); 

            const maxPer = parseInt(dropzone.dataset.max || '2', 10);
            const placedCount = dropzone.querySelectorAll('.speech-bubble.placed').length;

            if (placedCount >= maxPer) {
                feedbackMessage.textContent = 'Este quadro já está cheio';
                feedbackMessage.style.color = 'red';
                returnToOrigin(draggable); 
                return;
            }

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
                draggable.style.cursor = 'default'; 
                
                draggable.removeAttribute('data-x');
                draggable.removeAttribute('data-y');
                draggable.removeAttribute('data-start-x');
                draggable.removeAttribute('data-start-y');

                interact(draggable).unset();

                dropzone.appendChild(draggable);
                
                feedbackMessage.textContent = 'Correto!';
                feedbackMessage.style.color = 'green';

                checkWinCondition();

            } else {
                feedbackMessage.textContent = 'Tente novamente!';
                feedbackMessage.style.color = 'red';
                returnToOrigin(draggable); 
            }
        }
    });

    // Função que devolve o balão para a barra lateral ou quadro original
    function returnToOrigin(el) {
        const originId = el.dataset.originParent || 'palette';
        const origin = (originId === 'palette') ? paletteList : document.getElementById(originId);
        
        el.style.position = ''; 
        el.style.left = '';
        el.style.top = '';
        el.style.transform = ''; 
        el.style.cursor = 'grab';
        
        el.classList.remove('placed');
        el.classList.remove('correct');
        el.classList.remove('is-dragging');
        
        origin.appendChild(el);

        makeDraggable(el);
    }

    // Função técnica do interact.js para calcular o movimento enquanto arrasta
    function dragMoveListener(event) {
        const target = event.target;
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        target.style.transform = `translate(${x}px, ${y}px)`;

        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
    }

    function makeDraggable(el) {
        try { interact(el).unset(); } catch (e) {}

        // Configura o elemento com interact.js
        interact(el).draggable({
            inertia: true, 
            autoScroll: true, 
            listeners: {
                start(event) {
                    const t = event.target;
                    
                    if (t.classList.contains('correct')) {
                        event.preventDefault();
                        return;
                    }
                    
                    t.classList.add('is-dragging'); 
                    t.dataset.draggingFrom = t.parentElement.id || 'palette';

                    const rect = t.getBoundingClientRect();
                    const worldRect = worldEl.getBoundingClientRect();
                    
                    worldEl.appendChild(t); 
                    
                    const newLeft = rect.left - worldRect.left;
                    const newTop = rect.top - worldRect.top;
                    
                    t.style.position = 'absolute';
                    t.style.left = `${newLeft}px`;
                    t.style.top = `${newTop}px`;
                    t.style.transform = '';
                    t.setAttribute('data-x', 0);
                    t.setAttribute('data-y', 0);
                },
                move: dragMoveListener,
                end(event) {
                    const t = event.target;
                    t.classList.remove('is-dragging');
                    
                    if (!t.classList.contains('correct')) {
                        if (t.parentElement === worldEl) returnToOrigin(t);
                    }
                }
            }
        });
    }

    // Função extra 
    window.createBubble = function(bubbleId, text, placeInPanelId) {
        const div = document.createElement('div');
        div.className = 'speech-bubble draggable';
        div.dataset.bubbleId = String(bubbleId);
        div.textContent = text;
        div.dataset.originParent = 'palette';
        
        if (placeInPanelId) {
            const panel = document.getElementById(placeInPanelId);
            div.classList.add('correct', 'placed');
            div.style.position = 'absolute';
            div.style.left = `${(panel.clientWidth - 180) / 2}px`;
            div.style.top = `${(panel.clientHeight - 40) / 2}px`;
            panel.appendChild(div);
            interact(div).unset(); 
        } else {
            paletteList.appendChild(div);
            makeDraggable(div);
        }
        return div;
    };
});