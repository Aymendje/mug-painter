// ui-components.js - Custom UI components and dropdowns

import { state, GOOGLE_FONTS } from './config.js';

// === CUSTOM SELECT DROPDOWN COMPONENT ===
export class CustomSelect {
    constructor(element, initialValue, onChange) {
        this.element = element;
        this.trigger = element.querySelector('.custom-select-trigger');
        this.options = element.querySelector('.custom-options');
        this.textElement = this.trigger.querySelector('span');
        this.isOpen = false;
        this.selectedValue = initialValue;
        this.onChange = onChange;
        
        this.init();
    }
    
    init() {
        // Populate options
        this.populateOptions();
        
        // Set initial value
        this.setValue(this.selectedValue);
        
        // Event listeners
        this.trigger.addEventListener('click', () => this.toggle());
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target)) {
                this.close();
            }
        });
        
        // Keyboard support
        this.element.addEventListener('keydown', (e) => this.handleKeydown(e));
    }
    
    populateOptions() {
        this.options.innerHTML = '';
        GOOGLE_FONTS.forEach(font => {
            const option = document.createElement('div');
            option.className = 'custom-option';
            option.textContent = font;
            option.style.fontFamily = `"${font}", sans-serif`;
            option.dataset.value = font;
            
            option.addEventListener('click', () => {
                this.selectOption(font);
            });
            
            this.options.appendChild(option);
        });
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        this.isOpen = true;
        this.trigger.classList.add('open');
        this.options.classList.add('open');
        this.updateSelectedOption();
    }
    
    close() {
        this.isOpen = false;
        this.trigger.classList.remove('open');
        this.options.classList.remove('open');
    }
    
    setValue(value) {
        this.selectedValue = value;
        this.textElement.textContent = value;
        this.textElement.style.fontFamily = `"${value}", sans-serif`;
        this.updateSelectedOption();
    }
    
    selectOption(value) {
        this.setValue(value);
        this.close();
        if (this.onChange) {
            this.onChange(value);
        }
    }
    
    updateSelectedOption() {
        this.options.querySelectorAll('.custom-option').forEach(option => {
            option.classList.toggle('selected', option.dataset.value === this.selectedValue);
        });
    }
    
    handleKeydown(e) {
        if (!this.isOpen && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            this.open();
            return;
        }
        
        if (this.isOpen) {
            switch (e.key) {
                case 'Escape':
                    e.preventDefault();
                    this.close();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.navigateOptions(1);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.navigateOptions(-1);
                    break;
                case 'Enter':
                    e.preventDefault();
                    const focused = this.options.querySelector('.custom-option:focus');
                    if (focused) {
                        this.selectOption(focused.dataset.value);
                    }
                    break;
            }
        }
    }
    
    navigateOptions(direction) {
        const options = Array.from(this.options.querySelectorAll('.custom-option'));
        const currentIndex = options.findIndex(opt => opt.classList.contains('selected'));
        const newIndex = Math.max(0, Math.min(options.length - 1, currentIndex + direction));
        
        options[newIndex].focus();
    }
}
