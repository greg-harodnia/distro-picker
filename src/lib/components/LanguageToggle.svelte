<script lang="ts">
  import { locale, availableLanguages, t } from '$lib/i18n/locale';
  import type { Language } from '$lib/locales/types';
  import { onMount } from 'svelte';

  let isOpen = false;

  onMount(() => {
    locale.init();
  });

  function toggleDropdown() {
    isOpen = !isOpen;
  }

  function selectLanguage(code: Language) {
    locale.set(code);
    isOpen = false;
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.language-toggle-container')) {
      isOpen = false;
    }
  }

  $: currentLang = availableLanguages.find(l => l.code === $locale) || availableLanguages[0];
</script>

<svelte:window on:click={handleClickOutside} />

<div class="language-toggle-container">
  <button
    type="button"
    class="language-toggle btn-toggle"
    on:click|stopPropagation={toggleDropdown}
    aria-label={$t('language.toggle')}
    aria-expanded={isOpen}
    aria-haspopup="listbox"
  >
    <span class="lang-code">{currentLang.code.toUpperCase()}</span>
    <svg 
      class="chevron" 
      class:open={isOpen}
      width="12" 
      height="12" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      stroke-width="2"
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  </button>

  {#if isOpen}
    <div class="dropdown" role="listbox">
      {#each availableLanguages as lang}
        <button
          type="button"
          class="dropdown-item"
          class:selected={lang.code === $locale}
          on:click|stopPropagation={() => selectLanguage(lang.code)}
          role="option"
          aria-selected={lang.code === $locale}
        >
          <span class="lang-code">{lang.code.toUpperCase()}</span>
          <span class="lang-name">{lang.name}</span>
          {#if lang.code === $locale}
            <svg class="check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .language-toggle-container {
    position: relative;
    display: inline-block;
  }

  .language-toggle {
    gap: 4px;
    padding: 0 12px;
    height: 44px;
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
  }

  .chevron {
    transition: transform var(--transition-normal);
  }

  .chevron.open {
    transform: rotate(180deg);
  }

  .lang-code {
    font-size: var(--text-sm);
  }

  .dropdown {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    min-width: 140px;
    max-height: 280px;
    overflow-y: auto;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    z-index: 100;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 10px 12px;
    border: none;
    background: transparent;
    color: var(--color-text);
    cursor: pointer;
    transition: background var(--transition-fast);
    text-align: left;
  }

  .dropdown-item:hover {
    background: var(--color-background-secondary);
  }

  .dropdown-item.selected {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
    color: var(--color-background);
  }

  .lang-name {
    flex: 1;
    font-size: var(--text-sm);
  }

  .check {
    flex-shrink: 0;
  }

  .dropdown-item.selected .check {
    color: var(--color-background);
  }
</style>
