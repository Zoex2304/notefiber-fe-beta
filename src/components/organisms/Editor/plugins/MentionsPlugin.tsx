import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalTypeaheadMenuPlugin, MenuOption, useBasicTypeaheadTriggerMatch } from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { TextNode } from "lexical";
import { useCallback, useMemo, useState } from "react";
import * as React from "react";
import * as ReactDOM from "react-dom";

class MentionOption extends MenuOption {
    name: string;
    picture: React.ReactNode;

    constructor(name: string, picture: React.ReactNode) {
        super(name);
        this.name = name;
        this.picture = picture;
    }
}

function MentionsTypeaheadMenuItem({
    index,
    isSelected,
    onClick,
    onMouseEnter,
    option,
}: {
    index: number;
    isSelected: boolean;
    onClick: () => void;
    onMouseEnter: () => void;
    option: MentionOption;
}) {
    return (
        <li
            key={option.key}
            tabIndex={-1}
            className={`cursor-pointer p-2 ${isSelected ? "bg-gray-100" : ""}`}
            ref={option.setRefElement}
            role="option"
            aria-selected={isSelected}
            id={"typeahead-item-" + index}
            onMouseEnter={onMouseEnter}
            onClick={onClick}
        >
            <span className="text">{option.name}</span>
        </li>
    );
}

const MOCK_MENTIONS = [
    "Aayla Secura",
    "Adi Gallia",
    "Admiral Dodd Rancit",
    "Admiral Firmus Piett",
    "Admiral Gial Ackbar",
    "Admiral Ozzel",
    "Admiral Raddus",
    "Admiral Terrinald Screed",
    "Admiral Trench",
    "Admiral U.O. Statura",
    "Agen Kolar",
    "Agent Kallus",
    "Aiolin and Morit Astarte",
    "Aks Moe",
    "Almec",
    "Alton Kastle",
    "Ames Bunkle",
    "Amilda",
    "Amilyn Holdo",
    "Andray",
    "Angelique",
    "Anakin Skywalker",
    "Ahsoka Tano",
];

export default function MentionsPlugin() {
    const [editor] = useLexicalComposerContext();
    const [queryString, setQueryString] = useState<string | null>(null);

    const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
        minLength: 0,
    });

    const options = useMemo(
        () =>
            MOCK_MENTIONS.filter((name) => {
                if (!queryString) return true;
                return name.toLowerCase().includes(queryString.toLowerCase());
            }).map((name) => new MentionOption(name, <div />)),
        [queryString]
    );

    const onSelectOption = useCallback(
        (selectedOption: MentionOption, nodeToReplace: TextNode | null, closeMenu: () => void) => {
            editor.update(() => {
                const textNode = new TextNode(selectedOption.name);
                if (nodeToReplace) {
                    nodeToReplace.replace(textNode);
                }
                textNode.select();
                closeMenu();
            });
        },
        [editor]
    );

    return (
        <LexicalTypeaheadMenuPlugin<MentionOption>
            onQueryChange={setQueryString}
            onSelectOption={onSelectOption}
            triggerFn={checkForTriggerMatch}
            options={options}
            menuRenderFn={(
                anchorElementRef,
                { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
            ) => {
                if (anchorElementRef.current && options.length === 0) {
                    return null;
                }

                return anchorElementRef.current && options.length
                    ? ReactDOM.createPortal(
                        <div className="typeahead-popover bg-white shadow-lg border rounded-md p-1 absolute z-50 max-h-60 overflow-y-auto">
                            <ul>
                                {options.map((option, i) => (
                                    <MentionsTypeaheadMenuItem
                                        index={i}
                                        isSelected={selectedIndex === i}
                                        onClick={() => {
                                            setHighlightedIndex(i);
                                            selectOptionAndCleanUp(option);
                                        }}
                                        onMouseEnter={() => {
                                            setHighlightedIndex(i);
                                        }}
                                        key={option.key}
                                        option={option}
                                    />
                                ))}
                            </ul>
                        </div>,
                        anchorElementRef.current
                    )
                    : null;
            }}
        />
    );
}
