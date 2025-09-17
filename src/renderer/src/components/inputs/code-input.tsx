type CodeInputProps = {
  segments: string[];
  setSegments: (segments: string[]) => void;
};

export function CodeInput({ segments, setSegments }: CodeInputProps) {
  function onPaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text/plain');

    if (pasted.length === 6) {
      setSegments(pasted.split('').slice(0, segments.length));
    }
  }

  function update(index: number) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;

      setSegments([
        ...segments.slice(0, index),
        value,
        ...segments.slice(index + 1),
      ]);

      // Move to next input if a character was entered and we're not at the last input
      if (value && index < segments.length - 1) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }
    };
  }

  function handleKeyDown(index: number) {
    return (event: React.KeyboardEvent<HTMLInputElement>) => {
      // Move to previous input on backspace if current input is empty
      if (event.key === 'Backspace' && !segments[index] && index > 0) {
        const prevInput = document.getElementById(`code-${index - 1}`);
        prevInput?.focus();
      }
    };
  }

  return (
    <div className="flex mb-2 items-center justify-between space-x-2 rtl:space-x-reverse">
      {segments.map((s, key) => (
        <SingleInput
          id={key}
          value={s}
          onPaste={onPaste}
          key={key}
          onInput={update(key)}
          onKeyDown={handleKeyDown(key)}
        />
      ))}
    </div>
  );
}

type SingleInputProps = {
  id: number;
  value: string;
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  onInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

function SingleInput({
  id,
  value,
  onPaste,
  onInput,
  onKeyDown,
}: SingleInputProps) {
  return (
    <input
      onPaste={onPaste}
      type="text"
      maxLength={1}
      data-focus-input-init
      data-focus-input-prev={`code-${id - 1}`}
      data-focus-input-next={`code-${id + 1}`}
      id={`code-${id}`}
      value={value}
      onInput={onInput}
      onKeyDown={onKeyDown}
      className="focus:outline-primary-foreground block w-12 h-16 py-3 text-sm font-extrabold text-center text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-background dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
      required
    />
  );
}
