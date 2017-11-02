import logging
import argparse
import pandas as pd
import numpy as np
from tqdm import tqdm


logging.basicConfig()
logger = logging.getLogger('blake_relations')
logger.setLevel(-1)

IMMUTABLE_COLS = ['desc_id',
                  'dbi',
                  'bad_id',
                  'virtual_group',
                  'reference_copy_ids',
                  'reference_work_ids']

REFLEXIVE_COLS = ['same_matrix_ids',
                  'same_production_sequence_ids',
                  'similar_design_ids',
                  'reference_object_ids',
                  'supplemental_ids']


def load(file_name):
    """loads file, checks for required columns"""
    
    df = pd.read_csv(file_name)
    for col in REFLEXIVE_COLS + IMMUTABLE_COLS:
        assert col in df, "{} not in {}".format(col, file_name)
        
    return df


def flatten_to_series(df):
    """converts DataFrame into series"""
    lst = []
    for index, row in df.iterrows():
        lst.append((index,','.join(row.dropna().keys())))

    indexes = pd.DataFrame(lst)[0]
    mappings = pd.DataFrame(lst)[1]

    assert len(indexes.values) == len(mappings.values), "mappings and indexes must be same lenght"

    return pd.Series(data=mappings.values, index=indexes.values)


def mapped_relations_to_output_df(mapped_relations_df_dict, in_df):

    out_dict = {}

    for key in tqdm(REFLEXIVE_COLS):
        out_dict.update({key: flatten_to_series(mapped_relations_df_dict[key])})
        
    df = pd.DataFrame(out_dict)

    return in_df[[col for col in IMMUTABLE_COLS if col != 'desc_id']].merge(df[REFLEXIVE_COLS],
                                                                            left_index=True,
                                                                            right_index=True)  # add id columns back on


def normalize_relations(df):
    """
    Makes all relations in blake_relations.csv file reflexive.
    
    """
    
    result = {k: None for k in REFLEXIVE_COLS}
    diff_result = {k: None for k in REFLEXIVE_COLS}

    for k in tqdm(REFLEXIVE_COLS):
        # TODO : to_lower everything, normalize names

        key_df = pd.DataFrame(index=df.index, columns=df.index)

        out_lst = {}

        for desc_id, row in df[[k]].dropna().iterrows():
            desc_ids = []

            if isinstance(desc_id, basestring):
                try:
                    desc_ids = row.str.split(',')[k] # reference is necessary here

                    error_message = ''

                    if isinstance(desc_ids, list):
                        # any relationship not inserted into the index will be dropped forever,
                        # so we need to fail and force the user to fix the input file
                        desc_ids = [s.lower() for s in desc_ids]

                        try:
                            key_df.loc[[desc_id], desc_ids] = True
                        except KeyError as e:
                            logger.exception(e)
                            error_message = "error trying to associate row {} with columns {} \n".format(desc_id, desc_ids)

                    if error_message != '':
                        raise Exception(error_message)

                except TypeError as e:
                    assert np.isnan(desc_ids)

        pre_df = key_df.copy()

        for desc_id, row in df[[k]].dropna().iterrows():
            desc_ids = []

            if isinstance(desc_id, basestring):
                try:
                    desc_ids = row.str.split(',')[k] # reference is necessary here
                    error_message = ''

                    if isinstance(desc_ids, list):
                        # any relationship not inserted into the index will be dropped forever,
                        # so we need to fail and force the user to fix the input file
                        desc_ids = [s.lower() for s in desc_ids]

                        try:
                            key_df.loc[desc_ids, [desc_id]] = True  # make link in both directions, a->b and b->a
                        except KeyError as e:
                            logger.exception(e)
                            error_message += "error trying to associate rows {} with columns {}".format(desc_ids,
                                                                                                        desc_id)

                    if error_message != '':
                        raise Exception(error_message)

                except TypeError as e:
                    assert np.isnan(desc_ids) # TODO: is this right?

        post_df = key_df.copy()

        for index, row in post_df.where(~(pre_df.fillna(False) == post_df.fillna(False))).iterrows():
            new_edges = row.dropna().index.values
            for new_edge in new_edges:
                out_lst.update({index: new_edge})

        result[k] = key_df.copy()

        diff_result[k] = out_lst

    return mapped_relations_to_output_df(result, df), diff_result


def main(args):

    df = load(args.file)

    logger.info('blake_relations.csv size before drop duplicates: {}'.format(len(df)))
    logger.info('counts per desc_id: {}'.format(df.groupby('desc_id').size().sort_values(ascending=False).head(15)))
    df.drop_duplicates(subset='desc_id', keep='first', inplace=True)

    logger.info('blake_relations.csv size before after duplicates: {}'.format(len(df)))
    df.desc_id = df.desc_id.str.lower()
    df.set_index('desc_id', inplace=True)

    normalize_df, diff_dict = normalize_relations(df)

    normalize_df.to_csv(args.out_file, encoding='utf-8')

    if args.diff:
        for k, val in diff_dict.items():

            logger.info("New edges added for {}".format(k))
            logger.info("==================================")
            for _k, _v in val.items():
                logger.info("{} -> {}".format(_k, _v))

if __name__ == '__main__':

    parser = argparse.ArgumentParser(description='Process a blake_relations.csv file to make all mappings reciprocal')

    parser.add_argument("-d", "--diff", action="store_true", default=True)
    parser.add_argument("-o", "--out_suffix", default="reconciled")
    parser.add_argument("file", nargs='?')

    _args = parser.parse_args()

    (prefix, sep, suffix) = _args.file.rpartition('.')
    _args.out_file = prefix + "_" + _args.out_suffix + sep+suffix

    main(_args)
