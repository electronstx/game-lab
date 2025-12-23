export type Option = { label?: string; value: string | number };

export type ButtonGroupProps = {
    name?: string;
    options?: Option[];
    value?: Option['value'];
    defaultValue?: Option['value'];
    disabled?: boolean;
    onChange?: (option: Option) => void;
};
