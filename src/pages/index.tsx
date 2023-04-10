import * as React from 'react'
import TextField from '@mui/material/TextField'
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete'
import useMediaQuery from '@mui/material/useMediaQuery'
import ListSubheader from '@mui/material/ListSubheader'
import Popper from '@mui/material/Popper'
import { useTheme, styled } from '@mui/material/styles'
import { VariableSizeList, ListChildComponentProps } from 'react-window'
import Typography from '@mui/material/Typography'
import { Box } from '@mui/material'

const LISTBOX_PADDING = 8

function renderRow(props: ListChildComponentProps) {
    const { data, index, style } = props
    const dataSet = data[index]
    const inlineStyle = {
        ...style,
        top: (style.top as number) + LISTBOX_PADDING,
    }

    if (dataSet.hasOwnProperty('group')) {
        return (
            <ListSubheader
                key={dataSet.key}
                component="div"
                style={inlineStyle}
            >
                {dataSet.group}
            </ListSubheader>
        )
    }

    return (
        <Typography component="li" {...dataSet[0]} noWrap style={inlineStyle}>
            {`${dataSet[1]}`}
        </Typography>
    )
}

const OuterElementContext = React.createContext({})

const OuterElementType = React.forwardRef<HTMLDivElement>((props, ref) => {
    const outerProps = React.useContext(OuterElementContext)
    return <div ref={ref} {...props} {...outerProps} />
})

function useResetCache(data: any) {
    const ref = React.useRef<VariableSizeList>(null)
    React.useEffect(() => {
        if (ref.current != null) {
            ref.current.resetAfterIndex(0, true)
        }
    }, [data])
    return ref
}

// Adapter for react-window
const ListboxComponent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLElement>
>(function ListboxComponent(props, ref) {
    const { children, ...other } = props
    const itemData: React.ReactChild[] = []
    ;(children as React.ReactChild[]).forEach(
        (item: React.ReactChild & { children?: React.ReactChild[] }) => {
            itemData.push(item)
            itemData.push(...(item.children || []))
        }
    )

    const theme = useTheme()
    const smUp = useMediaQuery(theme.breakpoints.up('sm'), {
        noSsr: true,
    })
    const itemCount = itemData.length
    const itemSize = smUp ? 36 : 48

    const getChildSize = (child: React.ReactChild) => {
        if (child.hasOwnProperty('group')) {
            return 48
        }

        return itemSize
    }

    const getHeight = () => {
        if (itemCount > 8) {
            return 8 * itemSize
        }
        return itemData.map(getChildSize).reduce((a, b) => a + b, 0)
    }

    const gridRef = useResetCache(itemCount)

    return (
        <div ref={ref}>
            <OuterElementContext.Provider value={other}>
                <VariableSizeList
                    itemData={itemData}
                    height={getHeight() + 2 * LISTBOX_PADDING}
                    width="100%"
                    ref={gridRef}
                    outerElementType={OuterElementType}
                    innerElementType="ul"
                    itemSize={(index) => getChildSize(itemData[index])}
                    overscanCount={5}
                    itemCount={itemCount}
                >
                    {renderRow}
                </VariableSizeList>
            </OuterElementContext.Provider>
        </div>
    )
})

const StyledPopper = styled(Popper)({
    [`& .${autocompleteClasses.listbox}`]: {
        boxSizing: 'border-box',
        '& ul': {
            padding: 0,
            margin: 0,
        },
    },
})
export default function Home({ data }) {
    const [appData, setAppData] = React.useState(null)
    const [id, setId] = React.useState(null)

    const imageStyles = [
        'header.jpg',
        'logo.png',
        'library_hero.jpg',
        'library_hero_600x900.jpg',
        'page_bg_generated.jpg',
        'page_bg_generated_v6b.jpg',
    ]

    return (
        <Box width={'600px'} margin={'120px auto'}>
            <Typography
                variant="h1"
                fontWeight={'bold'}
                lineHeight={'1'}
                component="h3"
            >
                Steam Game <br /> Art Fetcher
            </Typography>
            <Box marginTop={'16px'}>
                <Autocomplete
                    id="virtualize-demo"
                    disableListWrap
                    PopperComponent={StyledPopper}
                    ListboxComponent={ListboxComponent}
                    options={data}
                    renderInput={(params) => (
                        <TextField {...params} label="Game titles" />
                    )}
                    getOptionLabel={(option: any) => option.name}
                    renderOption={(props, option, state) =>
                        [props, option.name, state.index] as React.ReactNode
                    }
                    onChange={(event, value) => {
                        setAppData(value)
                    }}
                />
            </Box>
            <Box
                marginTop={'16px'}
                width={'100%'}
                display={'grid'}
                gridAutoFlow={'dense'}
                gridTemplateColumns={'1fr 1fr'}
                columnGap={'16px'}
                justifyContent={'center'}
                alignItems={'center'}
            >
                {appData &&
                    imageStyles.map((style) => (
                        <Box position={'relative'}>
                            <a
                                target="_blank"
                                style={{ color: 'white', zIndex: '1' }}
                                href={`https://steamcdn-a.akamaihd.net/steam/apps/${appData.appid}/${style}`}
                            >
                                <Typography
                                    position={'absolute'}
                                    bgcolor={'#1B2838'}
                                >
                                    {style}
                                </Typography>
                                <img
                                    width={'100%'}
                                    key={style}
                                    src={`https://steamcdn-a.akamaihd.net/steam/apps/${appData.appid}/${style}`}
                                />
                            </a>
                        </Box>
                    ))}
            </Box>
        </Box>
    )
}

// This gets called on every request
export async function getServerSideProps() {
    // Fetch data from external API
    const res = await fetch(
        `https://api.steampowered.com/ISteamApps/GetAppList/v0002`
    )
    const d = await res.json()
    const data = d.applist.apps.filter((app) => app.name !== '')

    // Pass data to the page via props
    return { props: { data } }
}
