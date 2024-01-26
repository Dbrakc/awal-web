'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, HelpCircle, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import axios from 'axios';

import { LanguageRelations, getLanguageCode } from '../TranslatorConfig';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { RadioGroup } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { getSession, useSession } from 'next-auth/react';
import { Checkbox } from '@/components/ui/checkbox';
import useLocaleStore from '@/app/hooks/languageStore';
import { MessagesProps, getDictionary } from '@/i18n';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import useMediaQuery from '@/app/hooks/useMediaQuery';

const ValidateComp = () => {
    const [sourceText, setSourceText] = useState('');
    const [targetText, setTargetText] = useState('');
    const [sourceLanguage, setSourceLanguage] = useState(
        localStorage.getItem('sourceLanguage') || 'ca',
    );
    const [reportInput, setReportInput] = useState('');

    const [targetLanguage, setTargetLanguage] = useState(
        localStorage.getItem('targetLanguage') || 'zgh',
    );
    const [srcVar, setLeftRadioValue] = useState(
        localStorage.getItem('srcVar') || '',
    );
    const [tgtVar, setRightRadioValue] = useState(
        localStorage.getItem('tgtVar') || '',
    );
    const isAboveLgScreen = useMediaQuery('(min-width: 1024px)');
    const [triggerFetch, setTriggerFetch] = useState(0);
    // Update local storage when the language or variation changes
    useEffect(() => {
        localStorage.setItem('sourceLanguage', sourceLanguage);
        localStorage.setItem('targetLanguage', targetLanguage);
        localStorage.setItem('srcVar', srcVar);
        localStorage.setItem('tgtVar', tgtVar);
    }, [sourceLanguage, targetLanguage, srcVar, tgtVar]);

    const router = useRouter();
    const { data: session, update: sessionUpdate } = useSession();
    const [entry, setEntry] = useState<any>();
    const updatedSession = async () => {
        const session = await getSession();
        console.log(session);
    };
    const { locale } = useLocaleStore();
    const [d, setD] = useState<MessagesProps>();
    console.log(session);
    useEffect(() => {
        const fetchDictionary = async () => {
            const m = await getDictionary(locale);
            setD(m as unknown as MessagesProps);
        };
        fetchDictionary();
    }, [locale]);
    // render variations conditionally
    const renderRadioGroup = (side: 'left' | 'right') => {
        const languagesToRender =
            (side === 'left' && ['zgh', 'ber'].includes(sourceLanguage)) ||
            (side === 'right' && ['zgh', 'ber'].includes(targetLanguage));

        if (languagesToRender) {
            const radioGroupValue = side === 'left' ? srcVar : tgtVar;
            return (
                <RadioGroup className="flex flex-row mt-3 justify-between">
                    {['Central', 'Tarifit', 'Tachelhit', 'Other'].map(
                        (value) => (
                            <div
                                className="flex flex-row justify-start items-center space-x-2"
                                key={value}
                            >
                                <Checkbox
                                    value={value}
                                    id={`${value}-${side}`}
                                    checked={radioGroupValue === value}
                                    onCheckedChange={(newCheckedState) => {
                                        if (
                                            typeof newCheckedState === 'boolean'
                                        ) {
                                            const newValue = value; // 'value' is the value of the radio item
                                            side === 'left'
                                                ? setLeftRadioValue(newValue)
                                                : setRightRadioValue(newValue);
                                        }
                                    }}
                                />
                                <Label htmlFor={`${value}-${side}`}>
                                    {value}
                                </Label>
                            </div>
                        ),
                    )}
                </RadioGroup>
            );
        } else {
            return null;
        }
    };

    useEffect(() => {
        console.log('Left Radio Value:', srcVar);
        console.log('Right Radio Value:', tgtVar);
    }, [tgtVar, srcVar]);
    // Update target language options when source language changes
    useEffect(() => {
        const updateLanguages = () => {
            const relatedToSource = LanguageRelations[sourceLanguage] || [];
            const relatedToTarget = LanguageRelations[targetLanguage] || [];

            if (!relatedToSource.includes(targetLanguage)) {
                // Update target language if current target is not related to the new source
                setTargetLanguage(
                    relatedToSource.length > 0 ? relatedToSource[0] : '',
                );
            } else if (!relatedToTarget.includes(sourceLanguage)) {
                // Update source language if current source is not related to the new target
                setSourceLanguage(
                    relatedToTarget.length > 0 ? relatedToTarget[0] : '',
                );
            }
        };

        updateLanguages();
    }, [sourceLanguage, targetLanguage]);

    const validateLanguage: { [key: string]: string } = useMemo(
        () => ({
            en: 'English',
            zgh: 'ⵜⴰⵎⴰⵣⵉⵖⵜ',
            ber: 'Tamaziɣt',
            es: 'Español',
            ca: 'Català',
            fr: 'Français',
            ary: 'الدارجة',
        }),
        [],
    );

    const handleSourceLanguageChange = (language: string) => {
        setSourceLanguage(language);
        localStorage.setItem('sourceLanguage', language);
        if (!['zgh', 'ber'].includes(language)) {
            setLeftRadioValue('');
            localStorage.setItem('srcVar', '');
        }
    };

    const handleTargetLanguageChange = (language: string) => {
        setTargetLanguage(language);
        localStorage.setItem('targetLanguage', language);
        if (!['zgh', 'ber'].includes(language)) {
            setRightRadioValue('');
            localStorage.setItem('tgtVar', '');
        }
    };
    const renderLanguageOptions = useCallback(
        (isSourceLanguage: boolean) => {
            const availableLanguages = isSourceLanguage
                ? Object.keys(LanguageRelations)
                : LanguageRelations[sourceLanguage] || [];

            return availableLanguages.map((key) => (
                <DropdownMenuRadioItem key={key} value={key}>
                    {validateLanguage[key]}
                </DropdownMenuRadioItem>
            ));
        },
        [sourceLanguage, validateLanguage],
    );
    const validatorToaster = useMemo(() => d?.validator ?? ({} as any), [d]);

    // retrieve contribution item
    useEffect(() => {
        console.log(validatorToaster);
        const toastId = toast.loading(validatorToaster.alert_loading, {
            id: 'loading',
        });

        const fetchData = async () => {
            const srcLangCode = getLanguageCode(sourceLanguage);
            const tgtLangCode = getLanguageCode(targetLanguage);
            const srcLangVar = srcVar;
            const tgtLangVar = tgtVar;

            console.log(srcLangCode, srcLangVar, tgtLangVar);
            const apiUrl =
                process.env.NODE_ENV === 'development'
                    ? 'http://localhost:3000'
                    : 'https://awaldigital.org';

            try {
                const url = `${apiUrl}/api/contribute?src=${encodeURIComponent(
                    srcLangCode,
                )}&src_var=${encodeURIComponent(
                    srcLangVar,
                )}&tgt=${encodeURIComponent(
                    tgtLangCode,
                )}&tgt_var=${encodeURIComponent(tgtLangVar)}`;
                const res = await axios.get(url);
                console.log(res);
                console.log(res.status);
                console.log(res.data);
                if (res.data) {
                    setSourceText(res.data.src_text || '');
                    setTargetText(res.data.tgt_text || '');
					setLeftRadioValue(res.data.srcVar || '');
					setRightRadioValue(res.data.tgtVar || '');
                    setEntry(res.data);
                    toast.success(`${validatorToaster.success_loading}`, {
                        id: toastId,
                    });
                }
            } catch (error) {
                toast.dismiss(toastId);
                if (axios.isAxiosError(error) && error.response) {
                    if (error.response) {
                        setSourceText('');
                        setTargetText('');
                        if (error.response.statusText.includes('entries')) {
                            toast.error(
                                validatorToaster.alert_no_more_entries,
                                { id: 'no_entries' },
                            );
                        } else
                            toast.error(`${validatorToaster.alert_no_more_entries}`, {
                                id: 'no_entries',
                            });
                    } else {
                        // Something happened in setting up the request that triggered an error
                        console.error('Alguna cosa ha anat malament');
                    }
                } else {
                    // Handle non-Axios errors
                    console.error('Non-Axios error:', error);
                }
            }
        };
        fetchData();
    }, [
        sourceLanguage,
        targetLanguage,
        triggerFetch,
        srcVar,
        tgtVar,
        validatorToaster,
    ]);

    // validate post route
    const handleValidate = async () => {
        const data = { ...entry, validatorId: session?.user?.id };
        console.log(data);
        try {
            const res = await axios.patch('/api/contribute/accept', data);
            const validationScore = 3;
            const updatedUser = res.data;
            const { score, ...userWithoutScore } = updatedUser;
            console.log(userWithoutScore);
            sessionUpdate({ user: updatedUser });
            toast.success(
                `${
                    d?.validator.success_validation.text_before_link
                }${' '}${validationScore}${' '}${
                    d?.validator.success_validation.text_after_link
                }`,
            );
        } catch (error) {
            console.log(error);
        }
        setTriggerFetch((prev) => prev + 1);
    };

    const handleRejection = async () => {
        const data = { ...entry, validatorId: session?.user?.id };
        try {
            const res = await axios.patch('/api/contribute/reject', data);
            const validationScore = 3;
            const updatedUser = res.data;
            sessionUpdate({ user: updatedUser });
            console.log(updatedUser);
            const { score, ...userWithoutScore } = updatedUser;
            console.log(userWithoutScore);
            sessionUpdate({ user: updatedUser });
            toast.success(
                `${
                    d?.validator.success_validation.text_before_link
                }${' '}${validationScore}${' '}${
                    d?.validator.success_validation.text_after_link
                }`,
            );
        } catch (error) {
            console.log(error);
            toast(`${d?.validator.alert_no_more_entries}`, {
                icon: '❌',
            });
        }
        setTriggerFetch((prev) => prev + 1);
    };
    const handleReport = async () => {
        const data = {
            ...entry,
            reportMsg: reportInput,
            validatorId: session?.user?.id,
        };
        try {
            const res = await axios.patch('/api/contribute/report', data);
            const updatedUser = res.data;
            sessionUpdate({ user: updatedUser });
            const { score, ...userWithoutScore } = updatedUser;
            sessionUpdate({ user: updatedUser });
            toast.success(`${d?.toasters.success_report}`);
        } catch (error) {
            console.log(error);
            toast(`${d?.validator.alert_no_more_entries}`, {
                icon: '❌',
            });
        }
        setTriggerFetch((prev) => prev + 1);
    };
    const handleNext = async () => {
        try {
            const data = {
                ...entry,
                validatorId: session?.user?.id, // Explicitly include the ID of validator
            };
            console.log(data);
            const res = await axios.patch('/api/contribute', data);
            console.log(res);
        } catch (error) {}
        setTriggerFetch((prev) => prev + 1);
    };
    const SrcLanguageSelection = () => (
        <DropdownMenu>
            <DropdownMenuTrigger className="mb-5" asChild>
                <Button
                    variant="outline"
                    className="text-text-primary  bg-transparent border-text-primary"
                >
                    {validateLanguage[sourceLanguage]}
                    <ChevronDown className="pl-2 " />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-[#EFBB3F] border-[#EFBB3F] text-text-primary">
                <DropdownMenuLabel>
                    {d?.translator.select_lang}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                    value={sourceLanguage}
                    onValueChange={handleSourceLanguageChange}
                >
                    {renderLanguageOptions(true)}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const TgtLanguageSelection = () => (
        <DropdownMenu>
            <DropdownMenuTrigger className="mb-5" asChild>
                <Button
                    variant="outline"
                    className="text-text-primary  bg-transparent border-text-primary"
                >
                    {validateLanguage[targetLanguage]}
                    <ChevronDown className="pl-2 " />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-[#EFBB3F] border-[#EFBB3F] text-text-primary">
                <DropdownMenuLabel>
                    {d?.translator.select_lang}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                    value={targetLanguage}
                    onValueChange={handleTargetLanguageChange}
                >
                    {renderLanguageOptions(false)}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
    return (
        <>
            {isAboveLgScreen ? (
                <div className="text-translator">
                    <div className="flex flex-row justify-center items-baseline px-10 space-x-10">
                        <div className="w-1/2">
                            <SrcLanguageSelection />
                            <Textarea
                                value={sourceText}
                                className="border border-gray-300 h-[50vh] rounded-md shadow"
                                placeholder={
                                    d?.translator.placeholder.type_to_translate
                                }
                                id="src_message"
                                readOnly
                            />
                            {renderRadioGroup('left')}
                            <div className="flex flex-row justify-between items-center pt-10 w-full">
                                {sourceText.length > 0 &&
                                targetText.length > 0 ? (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant={'destructive'}>
                                                {d?.translator.report}
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md">
                                            <DialogHeader>
                                                <DialogTitle className="capitalize">
                                                    {
                                                        d?.texts
                                                            .validate_report_heading
                                                    }
                                                </DialogTitle>
                                                <DialogDescription className="capitalize">
                                                    {
                                                        d?.texts
                                                            .validate_report_text
                                                    }{' '}
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="flex items-center space-x-2">
                                                <div className="grid flex-1 gap-2">
                                                    <Input
                                                        value={reportInput}
                                                        onChange={(e) => {
                                                            setReportInput(
                                                                e.target.value,
                                                            );
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter className="sm:justify-start">
                                                <DialogClose asChild>
                                                    <Button
                                                        type="submit"
                                                        onClick={handleReport}
                                                    >
                                                        {d?.translator.report}
                                                    </Button>
                                                </DialogClose>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                ) : null}
                            </div>
                        </div>

                        <div className="w-1/2 ">
                            <div className="flex flex-row justify-between items-center">
                                <TgtLanguageSelection />
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            size={'lg'}
                                            className="cursor-pointer rounded-3xl m-1 text-xs capitalize"
                                        >
                                            {d?.how_to_validate_heading}
                                            <HelpCircle
                                                className="ml-2"
                                                size={15}
                                            />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="flex flex-col max-h-[50%] overflow-hidden">
                                        <AlertDialogHeader>
                                            {' '}
                                            <AlertDialogTitle className="flex items-center justify-center">
                                                <h4 className="text-sm font-semibold capitalize">
                                                    {d?.how_to_validate_heading}
                                                </h4>
                                            </AlertDialogTitle>
                                        </AlertDialogHeader>
                                        <div className="flex-grow overflow-auto">
                                            <AlertDialogDescription className="text-left whitespace-pre-wrap">
                                                {d?.how_it_works_validation}
                                                <ol className="list-disc space-y-2 my-4 mx-5 flex-row ">
                                                    <li>
                                                        {
                                                            d?.how_it_works_validation_1
                                                        }
                                                    </li>
                                                    <li>
                                                        {
                                                            d?.how_it_works_validation_2
                                                        }
                                                        <ol className="list-disc pl-4">
                                                            <li>
                                                                {
                                                                    d?.how_it_works_validation_2_1
                                                                }
                                                            </li>
                                                            <li>
                                                                {
                                                                    d?.how_it_works_validation_2_2
                                                                }
                                                            </li>
                                                            <li>
                                                                {
                                                                    d?.how_it_works_validation_2_3
                                                                }
                                                            </li>
                                                            <li>
                                                                {
                                                                    d?.how_it_works_validation_2_4
                                                                }
                                                            </li>

                                                            <li>
                                                                {
                                                                    d?.how_it_works_validation_2_5
                                                                }
                                                            </li>

                                                            <li>
                                                                {
                                                                    d?.how_it_works_validation_2_6
                                                                }
                                                            </li>
                                                            <li>
                                                                {
                                                                    d?.how_it_works_validation_2_6
                                                                }
                                                            </li>
                                                            <li>
                                                                {
                                                                    d?.how_it_works_validation_2_7
                                                                }
                                                            </li>
                                                        </ol>
                                                    </li>
                                                    <li>
                                                        {
                                                            d?.how_it_works_validation_3
                                                        }
                                                    </li>
                                                    {
                                                        d?.how_it_works_validation_continued
                                                    }
                                                </ol>
                                                {
                                                    d?.how_it_works_contribution_continued
                                                }
                                            </AlertDialogDescription>
                                        </div>
                                        <AlertDialogFooter className="flex-shrink-0">
                                            {' '}
                                            <AlertDialogCancel>
                                                {d?.btn.cancel}
                                            </AlertDialogCancel>
                                            <AlertDialogAction>
                                                {d?.btn.continue}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>

                            <Textarea
                                id="tgt_message"
                                className="border border-gray-300 h-[50vh] rounded-md shadow"
                                placeholder={
                                    d?.translator.placeholder.translation_box
                                }
                                value={targetText}
                                onChange={(e) => setTargetText(e.target.value)}
                                readOnly
                            />

                            {renderRadioGroup('right')}
                        </div>
                    </div>
                    <div className="flex-row-center space-x-4 my-3">
                        <Check
                            className="bg-green-500 rounded-full h-10 w-10 cursor-pointer p-2"
                            onClick={handleValidate}
                        />
                        <X
                            className="bg-red-500 rounded-full h-10 w-10 cursor-pointer p-2"
                            onClick={handleRejection}
                        />
                    </div>
                    <div
                        className="flex items-center justify-center my-2
			"
                    >
                        <Button
                            variant={'default'}
                            className="cursor-pointer"
                            onClick={handleNext}
                        >
                            {d?.btn.skip}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="text-translator">
                    <div className="flex flex-col justify-center items-baseline px-10">
                        <div className="w-full">
                            <SrcLanguageSelection />
                            <Textarea
                                value={sourceText}
                                className="border border-gray-300 h-auto rounded-md shadow"
                                placeholder={
                                    d?.translator.placeholder.type_to_translate
                                }
                                id="src_message"
                                readOnly
                            />
                            {renderRadioGroup('left')}
                            <div className="flex flex-row justify-between items-center pt-10 w-full">
                                {sourceText.length > 0 &&
                                targetText.length > 0 ? (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant={'destructive'}>
                                                {d?.translator.report}
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md">
                                            <DialogHeader>
                                                <DialogTitle className="capitalize">
                                                    {
                                                        d?.texts
                                                            .validate_report_heading
                                                    }
                                                </DialogTitle>
                                                <DialogDescription className="capitalize">
                                                    {
                                                        d?.texts
                                                            .validate_report_text
                                                    }{' '}
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="flex items-center space-x-2">
                                                <div className="grid flex-1 gap-2">
                                                    <Input
                                                        value={reportInput}
                                                        onChange={(e) => {
                                                            setReportInput(
                                                                e.target.value,
                                                            );
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter className="sm:justify-start">
                                                <DialogClose asChild>
                                                    <Button
                                                        type="submit"
                                                        onClick={handleReport}
                                                    >
                                                        {d?.translator.report}
                                                    </Button>
                                                </DialogClose>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                ) : null}
                            </div>
                        </div>

                        <div className="w-full">
                            <div className="flex flex-row justify-between items-baseline">
                                <TgtLanguageSelection />
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            size={'lg'}
                                            className="cursor-pointer rounded-3xl m-1 text-xs capitalize"
                                        >
                                            {d?.how_to_validate_heading}
                                            <HelpCircle
                                                className="ml-2"
                                                size={15}
                                            />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="flex flex-col max-h-[50%] overflow-hidden">
                                        <AlertDialogHeader>
                                            {' '}
                                            <AlertDialogTitle className="flex items-center justify-center">
                                                <h4 className="text-sm font-semibold capitalize">
                                                    {d?.how_to_validate_heading}
                                                </h4>
                                            </AlertDialogTitle>
                                        </AlertDialogHeader>
                                        <div className="flex-grow overflow-auto">
                                            <AlertDialogDescription className="text-left whitespace-pre-wrap">
                                                {d?.how_it_works_validation}
                                                <ol className="list-disc space-y-2 my-4 mx-5 flex-row ">
                                                    <li>
                                                        {
                                                            d?.how_it_works_validation_1
                                                        }
                                                    </li>
                                                    <li>
                                                        {
                                                            d?.how_it_works_validation_2
                                                        }
                                                        <ol className="list-disc pl-4">
                                                            <li>
                                                                {
                                                                    d?.how_it_works_validation_2_1
                                                                }
                                                            </li>
                                                            <li>
                                                                {
                                                                    d?.how_it_works_validation_2_2
                                                                }
                                                            </li>
                                                            <li>
                                                                {
                                                                    d?.how_it_works_validation_2_3
                                                                }
                                                            </li>
                                                            <li>
                                                                {
                                                                    d?.how_it_works_validation_2_4
                                                                }
                                                            </li>

                                                            <li>
                                                                {
                                                                    d?.how_it_works_validation_2_5
                                                                }
                                                            </li>

                                                            <li>
                                                                {
                                                                    d?.how_it_works_validation_2_6
                                                                }
                                                            </li>
                                                            <li>
                                                                {
                                                                    d?.how_it_works_validation_2_6
                                                                }
                                                            </li>
                                                            <li>
                                                                {
                                                                    d?.how_it_works_validation_2_7
                                                                }
                                                            </li>
                                                        </ol>
                                                    </li>
                                                    <li>
                                                        {
                                                            d?.how_it_works_validation_3
                                                        }
                                                    </li>
                                                    {
                                                        d?.how_it_works_validation_continued
                                                    }
                                                </ol>
                                                {
                                                    d?.how_it_works_contribution_continued
                                                }
                                            </AlertDialogDescription>
                                        </div>
                                        <AlertDialogFooter className="flex-shrink-0">
                                            {' '}
                                            <AlertDialogCancel>
                                                {d?.btn.cancel}
                                            </AlertDialogCancel>
                                            <AlertDialogAction>
                                                {d?.btn.continue}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>

                            <Textarea
                                id="tgt_message"
                                className="border border-gray-300 h-auto rounded-md shadow"
                                placeholder={
                                    d?.translator.placeholder.translation_box
                                }
                                value={targetText}
                                onChange={(e) => setTargetText(e.target.value)}
                                readOnly
                            />

                            {renderRadioGroup('right')}
                        </div>
                    </div>
                    <div className="flex-row-center space-x-4 my-3">
                        <Check
                            className="bg-green-500 rounded-full h-10 w-10 cursor-pointer p-2"
                            onClick={handleValidate}
                        />
                        <X
                            className="bg-red-500 rounded-full h-10 w-10 cursor-pointer p-2"
                            onClick={handleRejection}
                        />
                    </div>
                    <div className="flex items-center justify-center my-2">
                        <Button
                            variant={'default'}
                            className="cursor-pointer"
                            onClick={handleNext}
                        >
                            Skip
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ValidateComp;
